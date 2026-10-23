package com.loureiro.louri;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.PowerManager;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import org.json.*;
import java.text.SimpleDateFormat;
import java.util.*;

public final class ReminderEngine {
    public static final String CHANNEL = "louri_rotina_v2";
    private static final String PREFS = "louri_reminders_v2";
    private static final int ALARM = 6100, TEST = 6101;
    private ReminderEngine() {}
    private static android.content.SharedPreferences prefs(Context c) { return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE); }
    private static JSONObject plan(Context c) {
        try { return new JSONObject(prefs(c).getString("plan", "{}")); }
        catch (JSONException e) { return new JSONObject(); }
    }
    public static void channel(Context c) {
        if(Build.VERSION.SDK_INT<26)return;
        NotificationManager manager = c.getSystemService(NotificationManager.class);
        NotificationChannel channel = new NotificationChannel(CHANNEL, "Sua rotina no Louri", NotificationManager.IMPORTANCE_DEFAULT);
        channel.setDescription("Refeições, água e um incentivo no fim do dia. Respeita seu horário de silêncio.");
        manager.createNotificationChannel(channel);
    }
    public static boolean allowed(Context c) {
        if (Build.VERSION.SDK_INT >= 33 && c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return false;
        NotificationManager manager=c.getSystemService(NotificationManager.class);
        NotificationChannel channel=Build.VERSION.SDK_INT>=26?manager.getNotificationChannel(CHANNEL):null;
        return NotificationManagerCompat.from(c).areNotificationsEnabled() && (channel==null || channel.getImportance()!=NotificationManager.IMPORTANCE_NONE);
    }
    private static PendingIntent alarmIntent(Context c, boolean test) {
        Intent intent = new Intent(c, ReminderReceiver.class).setAction(test ? "com.loureiro.louri.REMINDER_TEST" : "com.loureiro.louri.REMINDER");
        return PendingIntent.getBroadcast(c, test?TEST:ALARM, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
    private static void arm(Context c, long at, boolean test) {
        AlarmManager alarm = c.getSystemService(AlarmManager.class);
        PendingIntent pending=alarmIntent(c,test);
        if (Build.VERSION.SDK_INT < 31 || alarm.canScheduleExactAlarms()) {
            try { alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,pending);return; }
            catch(SecurityException ignored) { /* permission may change between check and call */ }
        }
        alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,pending);
    }
    public static synchronized void sync(Context c, JSONObject incoming) {
        channel(c);
        prefs(c).edit().putString("plan",incoming.toString()).commit();
        reschedule(c);
    }
    private static String day() { return new SimpleDateFormat("yyyy-MM-dd",Locale.US).format(new Date()); }
    private static boolean done(JSONObject plan, JSONObject slot) {
        if (!day().equals(plan.optString("day"))) return false;
        String kind=slot.optString("kind");
        if (kind.equals("water")) return plan.optBoolean("waterDone");
        if (kind.equals("motivation")) return plan.optBoolean("complete");
        if (kind.equals("meal")) {
            JSONArray meals=plan.optJSONArray("doneMeals");
            if(meals!=null) for(int i=0;i<meals.length();i++) if(slot.optString("key").equals(meals.optString(i))) return true;
        }
        return false;
    }
    public static synchronized void reschedule(Context c) {
        AlarmManager alarm=c.getSystemService(AlarmManager.class);
        JSONObject p=plan(c);
        if(!p.optBoolean("enabled") || !allowed(c)) {
            alarm.cancel(alarmIntent(c,false));
            alarm.cancel(alarmIntent(c,true));
            prefs(c).edit().remove("nextAt").remove("nextSlot").apply();return;
        }
        JSONArray slots=p.optJSONArray("slots");
        Calendar now=Calendar.getInstance();
        long next=Long.MAX_VALUE;
        JSONObject chosen=null;
        if(slots!=null) for(int i=0;i<slots.length();i++) {
            JSONObject slot=slots.optJSONObject(i);
            if(slot==null) continue;
            int minute=slot.optInt("minute",-1);
            if(minute<0 || minute>=1440) continue;
            long at=ReminderClock.next(now,minute);
            // Never redeliver the same slot after an app resume or clock adjustment.
            String stamp=new SimpleDateFormat("yyyy-MM-dd",Locale.US).format(new Date(at))+":"+slot.optString("id");
            if(prefs(c).getBoolean("sent:"+stamp,false) || (sameDay(at)&&done(p,slot))) {
                Calendar tomorrow=(Calendar)now.clone();tomorrow.add(Calendar.DATE,1);
                tomorrow.set(Calendar.HOUR_OF_DAY,0);tomorrow.set(Calendar.MINUTE,0);tomorrow.set(Calendar.SECOND,0);tomorrow.set(Calendar.MILLISECOND,0);
                at=ReminderClock.next(tomorrow,minute);
                if(minute==0)at=tomorrow.getTimeInMillis();
            }
            if(at<next) { next=at;chosen=slot; }
        }
        if(chosen==null) { alarm.cancel(alarmIntent(c,false));prefs(c).edit().remove("nextAt").remove("nextSlot").apply();return; }
        // Persist before arming so the receiver can always recover the occurrence.
        prefs(c).edit().putLong("nextAt",next).putString("nextSlot",chosen.toString()).commit();
        arm(c,next,false);
    }
    private static boolean sameDay(long at) { return day().equals(new SimpleDateFormat("yyyy-MM-dd",Locale.US).format(new Date(at))); }
    public static synchronized void deliver(Context c, boolean test) {
        if(test) { show(c,"🥑 Alô, é o Louri!","Se este aviso chegou, nosso canal está funcionando. Agora é só cuidar da rotina.","/", "","test",6201);return; }
        JSONObject p=plan(c);
        long expected=prefs(c).getLong("nextAt",0);
        JSONObject slot;
        try { slot=new JSONObject(prefs(c).getString("nextSlot","{}")); }
        catch(JSONException e) {reschedule(c);return;}
        long now=System.currentTimeMillis();
        // Replaced or early alarms must not deliver a future occurrence.
        if(expected<=0 || now+1000<expected) {reschedule(c);return;}
        Calendar clock=Calendar.getInstance();int minute=clock.get(Calendar.HOUR_OF_DAY)*60+clock.get(Calendar.MINUTE);
        String stamp=new SimpleDateFormat("yyyy-MM-dd",Locale.US).format(new Date(expected))+":"+slot.optString("id");
        boolean fresh=now-expected<90*60*1000L;
        if(p.optBoolean("enabled")&&fresh&&sameDay(expected)&&!done(p,slot)&&!ReminderClock.silent(minute,p.optInt("quietStart",1320),p.optInt("quietEnd",420))&&!prefs(c).getBoolean("sent:"+stamp,false)) {
            JSONArray messages=slot.optJSONArray("messages");
            JSONObject message=messages==null||messages.length()==0?null:messages.optJSONObject(ReminderClock.variant(clock.get(Calendar.DAY_OF_YEAR),slot.optString("id"),messages.length()));
            if(message!=null)show(c,message.optString("title"),message.optString("body"),slot.optString("route","/"),slot.optString("key"),slot.optString("kind"),6200);
        }
        prefs(c).edit().putBoolean("sent:"+stamp,true).apply();
        // Doze support is applied on EVERY occurrence, including after reboot.
        reschedule(c);
    }
    private static void show(Context c,String title,String body,String route,String meal,String kind,int id) {
        channel(c);if(!allowed(c))return;
        Intent open=new Intent(c,MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP|Intent.FLAG_ACTIVITY_CLEAR_TOP).putExtra("louriRoute",route).putExtra("louriMeal",meal).putExtra("louriKind",kind);
        PendingIntent tap=PendingIntent.getActivity(c,id,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        android.app.Notification notification=new NotificationCompat.Builder(c,CHANNEL).setSmallIcon(R.drawable.ic_louri_notification).setColor(0xff00d563).setContentTitle(title).setContentText(body).setStyle(new NotificationCompat.BigTextStyle().bigText(body)).setContentIntent(tap).setAutoCancel(true).setOnlyAlertOnce(false).build();
        try { c.getSystemService(NotificationManager.class).notify(id,notification); }
        catch(SecurityException permissionChanged) {return;}
        prefs(c).edit().putLong("lastShown",System.currentTimeMillis()).apply();
    }
    public static void test(Context c,boolean delayed) {
        if(delayed)arm(c,System.currentTimeMillis()+60000,true);else deliver(c,true);
    }
    public static JSONObject status(Context c) throws JSONException {
        channel(c);
        AlarmManager alarm=c.getSystemService(AlarmManager.class);
        PowerManager power=c.getSystemService(PowerManager.class);
        return new JSONObject().put("permission",allowed(c)).put("exact",Build.VERSION.SDK_INT<31||alarm.canScheduleExactAlarms()).put("batteryUnrestricted",power.isIgnoringBatteryOptimizations(c.getPackageName())).put("nextAt",prefs(c).getLong("nextAt",0)).put("lastShown",prefs(c).getLong("lastShown",0));
    }
}

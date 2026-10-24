package com.loureiro.louri;
import android.content.*;
public class ReminderReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context,Intent intent) {
        String action=intent.getAction();
        if("com.loureiro.louri.REMINDER".equals(action)||"com.loureiro.louri.REMINDER_TEST".equals(action))ReminderEngine.deliver(context,"com.loureiro.louri.REMINDER_TEST".equals(action));
        else if("com.loureiro.louri.SNOOZE".equals(action))ReminderEngine.snooze(context,intent);
        else if("com.loureiro.louri.SNOOZE_DELIVER".equals(action))ReminderEngine.deliverSnooze(context);
        else ReminderEngine.reschedule(context);
    }
}

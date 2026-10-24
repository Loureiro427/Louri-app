package com.loureiro.louri;
import android.content.Intent;
import android.provider.Settings;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
@CapacitorPlugin(name="LouriReminders")
public class LouriRemindersPlugin extends Plugin {
    @PluginMethod public void sync(PluginCall call) {
        try { ReminderEngine.sync(getContext(),call.getObject("plan",new JSObject()));call.resolve(JSObject.fromJSONObject(ReminderEngine.status(getContext()))); }
        catch(Exception e) {call.reject("Não foi possível agendar os lembretes.",e);}
    }
    @PluginMethod public void status(PluginCall call) {
        try{call.resolve(JSObject.fromJSONObject(ReminderEngine.status(getContext())));}catch(Exception e){call.reject("Não foi possível consultar os lembretes.",e);}
    }
    @PluginMethod public void test(PluginCall call) {
        if(!ReminderEngine.allowed(getContext())){call.reject("Permita notificações do Louri antes de testar.");return;}
        ReminderEngine.test(getContext(),Boolean.TRUE.equals(call.getBoolean("delayed",false)));call.resolve();
    }
    @PluginMethod public void openSettings(PluginCall call) {
        Intent settings=new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE,getContext().getPackageName());
        getActivity().startActivity(settings);call.resolve();
    }
    @PluginMethod public void openAppSettings(PluginCall call) {
        Intent settings=new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,android.net.Uri.parse("package:"+getContext().getPackageName()));
        getActivity().startActivity(settings);call.resolve();
    }
    @PluginMethod public void consumeTap(PluginCall call) {
        Intent intent=getActivity().getIntent();JSObject target=new JSObject();
        if(intent!=null&&intent.hasExtra("louriRoute")) {
            target.put("day",intent.getStringExtra("louriDay"));target.put("route",intent.getStringExtra("louriRoute"));target.put("meal",intent.getStringExtra("louriMeal"));target.put("kind",intent.getStringExtra("louriKind"));
            intent.removeExtra("louriDay");intent.removeExtra("louriRoute");intent.removeExtra("louriMeal");intent.removeExtra("louriKind");
        }
        call.resolve(target);
    }
    @Override protected void handleOnNewIntent(Intent intent) {
        getActivity().setIntent(intent);
        notifyListeners("openReminder",new JSObject());
    }
}

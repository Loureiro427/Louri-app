package com.loureiro.louri;
import android.content.*;
public class ReminderReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context,Intent intent) {
        String action=intent.getAction();
        if("com.loureiro.louri.REMINDER".equals(action)||"com.loureiro.louri.REMINDER_TEST".equals(action))ReminderEngine.deliver(context,"com.loureiro.louri.REMINDER_TEST".equals(action));
        else ReminderEngine.reschedule(context);
    }
}

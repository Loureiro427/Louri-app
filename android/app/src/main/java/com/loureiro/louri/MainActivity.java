package com.loureiro.louri;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(LouriRemindersPlugin.class);
        super.onCreate(savedInstanceState);
    }
    @Override public void onStop() {
        super.onStop();
        try { ReminderEngine.reschedule(getApplicationContext()); }
        catch (RuntimeException error) { android.util.Log.e("LouriReminders", "Could not confirm background alarm", error); }
    }
}

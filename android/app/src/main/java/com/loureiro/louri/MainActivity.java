package com.loureiro.louri;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(LouriRemindersPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

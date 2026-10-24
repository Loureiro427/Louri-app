package com.loureiro.louri;
import org.junit.Test;
import static org.junit.Assert.*;
import java.util.*;
public class ReminderClockTest {
    @Test public void snoozeIsFifteenMinutesAndExpiresWithoutAnEarlyDelivery() {
        long now=100000000L,at=ReminderClock.snoozeAt(now);
        assertEquals(15*60*1000L,at-now);
        assertFalse(ReminderClock.freshSnooze(at,at-1));
        assertTrue(ReminderClock.freshSnooze(at,at));
        assertTrue(ReminderClock.freshSnooze(at,at+89*60*1000L));
        assertFalse(ReminderClock.freshSnooze(at,at+90*60*1000L));
        assertFalse(ReminderClock.freshSnooze(0,now));
        Calendar clock=date("America/Sao_Paulo",2026,10,23,21,50);
        clock.setTimeInMillis(ReminderClock.snoozeAt(clock.getTimeInMillis()));
        assertTrue(ReminderClock.silent(clock.get(Calendar.HOUR_OF_DAY)*60+clock.get(Calendar.MINUTE),1320,420));
    }
    @Test public void leavingAppPreservesAnAlarmWaitingForAndroidDelivery() {
        long scheduled=100000000L;
        assertTrue(ReminderClock.preserveOccurrence(scheduled,scheduled-1000));
        assertTrue(ReminderClock.preserveOccurrence(scheduled,scheduled+60000));
        assertFalse(ReminderClock.preserveOccurrence(scheduled,scheduled+90*60*1000L));
        assertFalse(ReminderClock.preserveOccurrence(0,scheduled));
        assertFalse(ReminderClock.preserveOccurrence(scheduled+27*60*60*1000L,scheduled));
    }
    private Calendar date(String zone,int year,int month,int day,int hour,int minute) {
        Calendar c=Calendar.getInstance(TimeZone.getTimeZone(zone));c.clear();c.set(year,month-1,day,hour,minute,0);return c;
    }
    @Test public void repeatsAcrossDaysWithoutUsingAnHourlyInterval() {
        Calendar now=date("America/Sao_Paulo",2026,10,23,8,0);
        Calendar actual=(Calendar)now.clone();actual.setTimeInMillis(ReminderClock.next(now,7*60));
        assertEquals(24,actual.get(Calendar.DAY_OF_MONTH));assertEquals(7,actual.get(Calendar.HOUR_OF_DAY));
        actual.setTimeInMillis(ReminderClock.next(actual,7*60));
        assertEquals(25,actual.get(Calendar.DAY_OF_MONTH));assertEquals(7,actual.get(Calendar.HOUR_OF_DAY));
    }
    @Test public void exactMinuteNeverTriggersAgainInSameDay() {
        Calendar now=date("UTC",2026,12,31,23,59);
        Calendar actual=(Calendar)now.clone();actual.setTimeInMillis(ReminderClock.next(now,1439));
        assertEquals(2027,actual.get(Calendar.YEAR));assertEquals(1,actual.get(Calendar.DAY_OF_MONTH));
    }
    @Test public void preservesWallClockAcrossDaylightSaving() {
        Calendar now=date("America/New_York",2026,3,7,9,0);
        Calendar actual=(Calendar)now.clone();actual.setTimeInMillis(ReminderClock.next(now,9*60));
        assertEquals(9,actual.get(Calendar.HOUR_OF_DAY));assertEquals(8,actual.get(Calendar.DAY_OF_MONTH));
        assertEquals(23*60*60*1000L,actual.getTimeInMillis()-now.getTimeInMillis());
    }
    @Test public void silenceSpansMidnightAndIncludesItsStartButNotEnd() {
        assertTrue(ReminderClock.silent(1320,1320,420));assertTrue(ReminderClock.silent(60,1320,420));
        assertFalse(ReminderClock.silent(420,1320,420));assertFalse(ReminderClock.silent(800,1320,420));
        assertFalse(ReminderClock.silent(600,600,600));assertTrue(ReminderClock.silent(600,540,720));
    }
    @Test public void copyVariesAcrossBothDaysAndWaterSlots() {
        Set<Integer> variants=new HashSet<>();
        for(int minute=420;minute<1320;minute+=120)variants.add(ReminderClock.variant(296,"water:"+minute,4));
        assertTrue(variants.size()>1);
        assertNotEquals(ReminderClock.variant(296,"water:420",4),ReminderClock.variant(297,"water:420",4));
        assertEquals(0,ReminderClock.variant(296,"water:420",1));
        assertEquals(0,ReminderClock.variant(296,"water:420",0));
    }
}

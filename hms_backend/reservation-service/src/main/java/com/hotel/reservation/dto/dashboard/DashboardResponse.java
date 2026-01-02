package com.hotel.reservation.dto.dashboard;

public class DashboardResponse {
  private TodayAction[] todayActions;
  private RoomSnapshot roomSnapshot;
  private AlertItem[] alerts;
  private DashboardSummary summary;

  public TodayAction[] getTodayActions() {
    return todayActions;
  }

  public void setTodayActions(TodayAction[] todayActions) {
    this.todayActions = todayActions;
  }

  public RoomSnapshot getRoomSnapshot() {
    return roomSnapshot;
  }

  public void setRoomSnapshot(RoomSnapshot roomSnapshot) {
    this.roomSnapshot = roomSnapshot;
  }

  public AlertItem[] getAlerts() {
    return alerts;
  }

  public void setAlerts(AlertItem[] alerts) {
    this.alerts = alerts;
  }

  public DashboardSummary getSummary() {
    return summary;
  }

  public void setSummary(DashboardSummary summary) {
    this.summary = summary;
  }
}

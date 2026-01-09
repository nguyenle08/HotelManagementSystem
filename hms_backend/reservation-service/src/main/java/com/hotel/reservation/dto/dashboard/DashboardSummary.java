package com.hotel.reservation.dto.dashboard;

public class DashboardSummary {
  private int checkInToday;
  private int checkOutToday;
  private int overdue;

  public int getCheckInToday() {
    return checkInToday;
  }
  public void setCheckInToday(int checkInToday) {
    this.checkInToday = checkInToday;
  }
  public int getCheckOutToday() {
    return checkOutToday;
  }
  public void setCheckOutToday(int checkOutToday) {
    this.checkOutToday = checkOutToday;
  }
  public int getOverdue() {
    return overdue;
  }
  public void setOverdue(int overdue) {
    this.overdue = overdue;
  }
}

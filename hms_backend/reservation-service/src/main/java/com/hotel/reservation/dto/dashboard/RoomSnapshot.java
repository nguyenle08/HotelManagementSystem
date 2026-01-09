package com.hotel.reservation.dto.dashboard;

public class RoomSnapshot {
  private int available;
  private int occupied;
  private int cleaning;
  private int attention;
  private int cleaningOverdue;

  public int getAvailable() {
    return available;
  }
  public void setAvailable(int available) {
    this.available = available;
  }
  public int getOccupied() {
    return occupied;
  }
  public void setOccupied(int occupied) {
    this.occupied = occupied;
  }
  public int getCleaning() {
    return cleaning;
  }
  public void setCleaning(int cleaning) {
    this.cleaning = cleaning;
  }
  public int getAttention() {
    return attention;
  }
  public void setAttention(int attention) {
    this.attention = attention;
  }
  public int getCleaningOverdue() {
    return cleaningOverdue;
  }
  public void setCleaningOverdue(int cleaningOverdue) {
    this.cleaningOverdue = cleaningOverdue;
  }
}

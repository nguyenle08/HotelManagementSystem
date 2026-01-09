package com.hotel.reservation.dto.dashboard;

public class TodayAction {
  private String type;
  private String time;
  private String guestName;
  private String roomNumber;
  private String reservationId;
  private String typeLabel;

  public String getType() {
    return type;
  }
  public void setType(String type) {
    this.type = type;
  }
  public String getTime() {
    return time;
  }
  public void setTime(String time) {
    this.time = time;
  }
  public String getGuestName() {
    return guestName;
  }
  public void setGuestName(String guestName) {
    this.guestName = guestName;
  }
  public String getRoomNumber() {
    return roomNumber;
  }
  public void setRoomNumber(String roomNumber) {
    this.roomNumber = roomNumber;
  }
  public String getReservationId() {
    return reservationId;
  }
  public void setReservationId(String reservationId) {
    this.reservationId = reservationId;
  }
  public String getTypeLabel() {
    return typeLabel;
  }
  public void setTypeLabel(String typeLabel) {
    this.typeLabel = typeLabel;
  }
}

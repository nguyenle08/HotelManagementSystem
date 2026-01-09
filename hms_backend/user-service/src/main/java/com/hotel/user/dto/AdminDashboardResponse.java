package com.hotel.user.dto;

import lombok.Data;

import java.util.List;

@Data
public class AdminDashboardResponse {
    private long totalUsers;
    private long activeUsers;
    private long staffCount;
    private long lockedAccounts;
    private List<RoleStat> roleStats;
    private List<AccountStatusStat> accountStatus;
    private List<RecentActivity> recentActivities;

    @Data
    public static class RoleStat {
        private String role;
        private long count;
        private double percent;
    }

    @Data
    public static class AccountStatusStat {
        private String status;
        private long count;
        private double percent;
    }

    @Data
    public static class RecentActivity {
        private String type;
        private String message;
        private String time;
    }
}

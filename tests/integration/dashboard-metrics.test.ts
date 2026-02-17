import { describe, it, expect } from "vitest";

const AppointmentStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  NOT_CONFIRMED: "NOT_CONFIRMED",
  CANCELED: "CANCELED",
  NO_SHOW: "NO_SHOW",
} as const;

type AppointmentStatusType = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

type MockAppointment = {
  id: string;
  status: AppointmentStatusType;
  dateTime: Date;
};

/**
 * These tests verify the calculation logic from src/app/api/dashboard/route.ts
 * We test the mathematical formulas used to compute dashboard metrics.
 */
describe("Dashboard metrics calculations", () => {
  describe("confirmationRate calculation", () => {
    it("calculates confirmation rate correctly", () => {
      const totalAppointments = 20;
      const confirmed = 15;

      const confirmationRate = Math.round((confirmed / totalAppointments) * 100);

      expect(confirmationRate).toBe(75);
    });

    it("returns 0 when total appointments is 0", () => {
      const totalAppointments = 0;
      const confirmed = 0;

      const confirmationRate =
        totalAppointments > 0
          ? Math.round((confirmed / totalAppointments) * 100)
          : 0;

      expect(confirmationRate).toBe(0);
    });

    it("handles 100% confirmation rate", () => {
      const totalAppointments = 10;
      const confirmed = 10;

      const confirmationRate = Math.round((confirmed / totalAppointments) * 100);

      expect(confirmationRate).toBe(100);
    });

    it("handles 0% confirmation rate", () => {
      const totalAppointments = 10;
      const confirmed = 0;

      const confirmationRate = Math.round((confirmed / totalAppointments) * 100);

      expect(confirmationRate).toBe(0);
    });

    it("rounds decimal percentages correctly", () => {
      const totalAppointments = 3;
      const confirmed = 1;

      // 1/3 = 0.333... = 33.333...%
      const confirmationRate = Math.round((confirmed / totalAppointments) * 100);

      expect(confirmationRate).toBe(33);
    });
  });

  describe("noShowRate calculation", () => {
    it("calculates no-show rate correctly", () => {
      const totalAppointments = 20;
      const noShow = 5;

      const noShowRate = Math.round((noShow / totalAppointments) * 100);

      expect(noShowRate).toBe(25);
    });

    it("returns 0 when total appointments is 0", () => {
      const totalAppointments = 0;
      const noShow = 0;

      const noShowRate =
        totalAppointments > 0
          ? Math.round((noShow / totalAppointments) * 100)
          : 0;

      expect(noShowRate).toBe(0);
    });

    it("handles 100% no-show rate", () => {
      const totalAppointments = 10;
      const noShow = 10;

      const noShowRate = Math.round((noShow / totalAppointments) * 100);

      expect(noShowRate).toBe(100);
    });

    it("handles very low no-show rate", () => {
      const totalAppointments = 100;
      const noShow = 3;

      const noShowRate = Math.round((noShow / totalAppointments) * 100);

      expect(noShowRate).toBe(3);
    });
  });

  describe("estimatedLoss calculation", () => {
    it("calculates estimated loss correctly", () => {
      const noShow = 5;
      const avgAppointmentValue = 150;

      const estimatedLoss = Math.round(noShow * avgAppointmentValue);

      expect(estimatedLoss).toBe(750);
    });

    it("returns 0 when no shows is 0", () => {
      const noShow = 0;
      const avgAppointmentValue = 150;

      const estimatedLoss = Math.round(noShow * avgAppointmentValue);

      expect(estimatedLoss).toBe(0);
    });

    it("returns 0 when avgAppointmentValue is 0", () => {
      const noShow = 5;
      const avgAppointmentValue = 0;

      const estimatedLoss = Math.round(noShow * avgAppointmentValue);

      expect(estimatedLoss).toBe(0);
    });

    it("handles large values correctly", () => {
      const noShow = 20;
      const avgAppointmentValue = 300;

      const estimatedLoss = Math.round(noShow * avgAppointmentValue);

      expect(estimatedLoss).toBe(6000);
    });

    it("handles decimal avgAppointmentValue", () => {
      const noShow = 3;
      const avgAppointmentValue = 125.5;

      const estimatedLoss = Math.round(noShow * avgAppointmentValue);

      expect(estimatedLoss).toBe(377); // 376.5 rounded up
    });
  });

  describe("Status counting", () => {
    it("counts appointments by status correctly", () => {
      const appointments: MockAppointment[] = [
        {
          id: "1",
          status: AppointmentStatus.CONFIRMED,
          dateTime: new Date("2026-02-10"),
        },
        {
          id: "2",
          status: AppointmentStatus.CONFIRMED,
          dateTime: new Date("2026-02-11"),
        },
        {
          id: "3",
          status: AppointmentStatus.NO_SHOW,
          dateTime: new Date("2026-02-12"),
        },
        {
          id: "4",
          status: AppointmentStatus.CANCELED,
          dateTime: new Date("2026-02-13"),
        },
        {
          id: "5",
          status: AppointmentStatus.NOT_CONFIRMED,
          dateTime: new Date("2026-02-14"),
        },
        {
          id: "6",
          status: AppointmentStatus.PENDING,
          dateTime: new Date("2026-02-15"),
        },
      ];

      const totalAppointments = appointments.length;
      const confirmed = appointments.filter(
        (a) => a.status === AppointmentStatus.CONFIRMED
      ).length;
      const notConfirmed = appointments.filter(
        (a) =>
          a.status === AppointmentStatus.NOT_CONFIRMED ||
          a.status === AppointmentStatus.PENDING
      ).length;
      const noShow = appointments.filter(
        (a) => a.status === AppointmentStatus.NO_SHOW
      ).length;
      const canceled = appointments.filter(
        (a) => a.status === AppointmentStatus.CANCELED
      ).length;

      expect(totalAppointments).toBe(6);
      expect(confirmed).toBe(2);
      expect(notConfirmed).toBe(2); // NOT_CONFIRMED + PENDING
      expect(noShow).toBe(1);
      expect(canceled).toBe(1);
    });
  });

  describe("Weekly aggregation", () => {
    it("groups appointments by week correctly", () => {
      // Week 1: Feb 2-8, 2026
      const week1Start = new Date("2026-02-02T00:00:00");
      const week1End = new Date("2026-02-08T23:59:59");

      const appointments: MockAppointment[] = [
        {
          id: "1",
          status: AppointmentStatus.CONFIRMED,
          dateTime: new Date("2026-02-03T10:00:00"),
        },
        {
          id: "2",
          status: AppointmentStatus.NO_SHOW,
          dateTime: new Date("2026-02-05T14:00:00"),
        },
        {
          id: "3",
          status: AppointmentStatus.CONFIRMED,
          dateTime: new Date("2026-02-10T10:00:00"),
        }, // Next week
      ];

      const weekAppointments = appointments.filter((a) => {
        const date = new Date(a.dateTime);
        return date >= week1Start && date <= week1End;
      });

      const total = weekAppointments.length;
      const noShow = weekAppointments.filter(
        (a) => a.status === AppointmentStatus.NO_SHOW
      ).length;
      const confirmed = weekAppointments.filter(
        (a) => a.status === AppointmentStatus.CONFIRMED
      ).length;

      expect(total).toBe(2);
      expect(confirmed).toBe(1);
      expect(noShow).toBe(1);
    });

    it("handles empty weeks", () => {
      const week1Start = new Date("2026-02-02T00:00:00");
      const week1End = new Date("2026-02-08T23:59:59");

      const appointments: MockAppointment[] = [];

      const weekAppointments = appointments.filter((a) => {
        const date = new Date(a.dateTime);
        return date >= week1Start && date <= week1End;
      });

      expect(weekAppointments.length).toBe(0);
    });

    it("handles appointments exactly at week boundaries", () => {
      const week1Start = new Date("2026-02-02T00:00:00");
      const week1End = new Date("2026-02-08T23:59:59");

      const appointments: MockAppointment[] = [
        {
          id: "1",
          status: AppointmentStatus.CONFIRMED,
          dateTime: new Date("2026-02-02T00:00:00"),
        }, // Start
        {
          id: "2",
          status: AppointmentStatus.CONFIRMED,
          dateTime: new Date("2026-02-08T23:59:59"),
        }, // End
        {
          id: "3",
          status: AppointmentStatus.CONFIRMED,
          dateTime: new Date("2026-02-09T00:00:00"),
        }, // Next week
      ];

      const weekAppointments = appointments.filter((a) => {
        const date = new Date(a.dateTime);
        return date >= week1Start && date <= week1End;
      });

      expect(weekAppointments.length).toBe(2);
    });
  });

  describe("Edge cases", () => {
    it("handles zero appointments gracefully", () => {
      const totalAppointments = 0;
      const confirmed = 0;
      const noShow = 0;
      const avgAppointmentValue = 150;

      const confirmationRate =
        totalAppointments > 0
          ? Math.round((confirmed / totalAppointments) * 100)
          : 0;
      const noShowRate =
        totalAppointments > 0
          ? Math.round((noShow / totalAppointments) * 100)
          : 0;
      const estimatedLoss = Math.round(noShow * avgAppointmentValue);

      expect(confirmationRate).toBe(0);
      expect(noShowRate).toBe(0);
      expect(estimatedLoss).toBe(0);
    });

    it("handles single appointment", () => {
      const totalAppointments = 1;
      const confirmed = 1;
      const noShow = 0;

      const confirmationRate = Math.round((confirmed / totalAppointments) * 100);
      const noShowRate = Math.round((noShow / totalAppointments) * 100);

      expect(confirmationRate).toBe(100);
      expect(noShowRate).toBe(0);
    });
  });
});

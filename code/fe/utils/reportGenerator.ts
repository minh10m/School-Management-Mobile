import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { DashboardStats } from "../types/dashboard";

export const reportGenerator = {
  generateAdminReport: async (stats: DashboardStats, schoolYear: number) => {
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #F97316; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { color: #F97316; margin: 0; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; border-left: 4px solid #F97316; padding-left: 10px; margin-bottom: 15px; background: #FFF7ED; padding-top: 5px; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #E5E7EB; padding: 12px; text-align: left; }
            th { background-color: #F9FAFB; font-weight: bold; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .stat-box { border: 1px solid #E5E7EB; padding: 15px; border-radius: 8px; }
            .stat-label { font-size: 12px; color: #6B7280; margin-bottom: 5px; }
            .stat-value { font-size: 20px; font-weight: bold; color: #111827; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9CA3AF; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BÁO CÁO QUẢN TRỊ TRƯỜNG HỌC</h1>
            <p>Năm học: ${schoolYear}</p>
            <p>Ngày lập: ${new Date().toLocaleDateString("vi-VN")}</p>
          </div>

          <div class="section">
            <div class="section-title">1. Tổng quan nguồn lực</div>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">Tổng số học sinh</div>
                <div class="stat-value">${stats.totalStudents}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Tổng số giáo viên</div>
                <div class="stat-value">${stats.totalTeachers}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Số lớp học</div>
                <div class="stat-value">${stats.totalClasses}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Số môn học</div>
                <div class="stat-value">${stats.totalSubjects}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">2. Tình hình Tài chính (Học phí)</div>
            <table>
              <tr>
                <th>Hạng mục</th>
                <th>Số tiền / Số lượng</th>
              </tr>
              <tr>
                <td>Tổng doanh thu dự kiến</td>
                <td>${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(stats.finance.totalExpectedRevenue)}</td>
              </tr>
              <tr>
                <td>Đã thực thu</td>
                <td>${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(stats.finance.totalCollectedRevenue)}</td>
              </tr>
              <tr>
                <td>Còn nợ phí</td>
                <td style="color: red;">${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(stats.finance.totalPendingRevenue)}</td>
              </tr>
              <tr>
                <td>Số học sinh chưa hoàn thành</td>
                <td>${stats.finance.studentsWithOverdueFees} học sinh</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">3. Hiệu suất Học tập & Chuyên cần</div>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">Tỉ lệ chuyên cần trung bình</div>
                <div class="stat-value">${stats.attendance.overallAttendanceRate}%</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Tỉ lệ hoàn thành bài tập</div>
                <div class="stat-value">${stats.academic.assignmentCompletionRate}%</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">4. Phân bổ học lực</div>
            <table>
              <tr>
                <th>Xếp loại</th>
                <th>Số lượng học sinh</th>
              </tr>
              ${stats.academic.gradeDistribution
                .map(
                  (g) => `
                <tr>
                  <td>${g.gradeLabel}</td>
                  <td>${g.count}</td>
                </tr>
              `
                )
                .join("")}
            </table>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} EduManage System - Hệ thống Quản lý Trường học Thông minh</p>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  },
};

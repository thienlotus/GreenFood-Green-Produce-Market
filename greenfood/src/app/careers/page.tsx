"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Briefcase, MapPin, DollarSign, Clock, Users, Heart, Award, ArrowUpRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CareersPage() {
  const [selectedDept, setSelectedDept] = useState('all');

  const jobs = [
    {
      id: 1,
      title: "Kỹ Sư Quản Lý Chất Lượng Nông Sản (QC Lead)",
      dept: "qc",
      deptName: "Kiểm Định Chất Lượng",
      location: "TP. Hồ Chí Minh & Tiền Giang",
      type: "Toàn thời gian",
      salary: "15 - 22 triệu VNĐ",
      desc: "Kiểm tra chất lượng nông sản tại các nông trường đối tác, theo dõi quy chuẩn đóng gói và nhiệt độ chuỗi lạnh."
    },
    {
      id: 2,
      title: "Chuyên Viên Phát Triển Mạng Lưới Nông Hộ (Farmer Relationship)",
      dept: "sourcing",
      deptName: "Thu Mua & Nguồn Hàng",
      location: "Lâm Đồng / Đắk Lắk / Miền Tây",
      type: "Toàn thời gian",
      salary: "14 - 20 triệu VNĐ + Thưởng",
      desc: "Tìm kiếm, khảo sát và đàm phán hợp tác bao tiêu sản lượng với các hợp tác xã, vườn trồng tiêu chuẩn VietGAP."
    },
    {
      id: 3,
      title: "Lập Trình Viên Fullstack (Next.js / Laravel)",
      dept: "tech",
      deptName: "Công Nghệ Thông Tin",
      location: "TP. Hồ Chí Minh (Hybrid)",
      type: "Toàn thời gian",
      salary: "20 - 35 triệu VNĐ",
      desc: "Xây dựng và tối ưu hệ thống thương mại điện tử, bản đồ nông hộ thông minh, và công cụ quản trị logistics kho vận."
    },
    {
      id: 4,
      title: "Nhân Viên Điều Phối Giao Hàng Siêu Tốc (Dispatcher)",
      dept: "logistics",
      deptName: "Vận Hành & Kho Vận",
      location: "Kho Quận 10, TP. Hồ Chí Minh",
      type: "Theo ca linh hoạt",
      salary: "8 - 12 triệu VNĐ",
      desc: "Theo dõi đơn hàng, phân bổ tuyến giao hàng hỏa tốc cho tài xế và đảm bảo giữ nhiệt độ tiêu chuẩn cho đơn lạnh."
    },
    {
      id: 5,
      title: "Chuyên Viên Content Marketing & Nông Sản Bản Địa",
      dept: "marketing",
      deptName: "Truyền Thông & Marketing",
      location: "TP. Hồ Chí Minh",
      type: "Toàn thời gian",
      salary: "10 - 16 triệu VNĐ",
      desc: "Kể những câu chuyện truyền cảm hứng về người nông dân Việt, phát triển nội dung video ngắn trên TikTok, Reels."
    }
  ];

  const filteredJobs = selectedDept === 'all' 
    ? jobs 
    : jobs.filter(j => j.dept === selectedDept);

  const perks = [
    { title: "Nông Sản Sạch Miễn Phí", desc: "Trợ cấp rau quả hữu cơ sạch tươi ngon mỗi tuần cho toàn thể nhân viên." },
    { title: "Bảo Hiểm Toàn Diện", desc: "Gói bảo hiểm sức khỏe cao cấp Bảo Việt / Manulife sau thời gian thử việc." },
    { title: "Môi Trường Trẻ Trung", desc: "Văn hóa phẳng, khuyến khích sáng tạo và trao quyền thử nghiệm giải pháp mới." },
    { title: "Đào Tạo Chuyên Sâu", desc: "Được tài trợ tham gia các khóa học nâng cao kỹ năng và du khảo thực địa nhà vườn." }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Tuyển dụng</span>
        </div>
      </div>

      {/* Hero */}
      <div className="container mx-auto px-4 lg:px-8 mb-12">
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-8 lg:p-14 shadow-lg text-center max-w-4xl mx-auto">
          <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-xs uppercase px-3 py-1 rounded-full font-bold tracking-wider inline-block mb-4">
            Gia Nhập Đội Ngũ GreenFood
          </span>
          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Cùng Chúng Tôi Nâng Tầm Nông Sản Việt
          </h1>
          <p className="text-emerald-100 text-base lg:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Tại GreenFood, mỗi thành viên đều là một mắt xích quan trọng trong sứ mệnh kết nối triệu gia đình với nguồn thực phẩm an lành và bền vững.
          </p>
          <a href="#openings" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-lg shadow-md transition-all inline-flex items-center gap-2">
            Khám phá vị trí đang mở <ChevronRight size={16} />
          </a>
        </div>
      </div>

      {/* Perks */}
      <div className="container mx-auto px-4 lg:px-8 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Đãi Ngộ Tại GreenFood</h2>
          <p className="text-gray-600">Chúng tôi tạo dựng môi trường làm việc lấy con người và giá trị sống làm trung tâm.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((p, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-4">
                0{idx + 1}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Job Openings */}
      <div id="openings" className="container mx-auto px-4 lg:px-8 max-w-5xl mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Vị Trí Đang Tuyển Dụng</h2>
            <p className="text-sm text-gray-500 mt-1">Đang có {jobs.length} cơ hội mở tại các phòng ban</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'qc', label: 'Chất lượng (QC)' },
              { id: 'tech', label: 'Công nghệ' },
              { id: 'sourcing', label: 'Thu mua' },
              { id: 'marketing', label: 'Marketing' },
              { id: 'logistics', label: 'Vận hành' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedDept(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedDept === tab.id 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                      {job.deptName}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={14} /> {job.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{job.desc}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <DollarSign size={14} /> {job.salary}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pt-2 lg:pt-0">
                  <button 
                    onClick={() => toast.success(`Bạn đã chọn ứng tuyển "${job.title}". Vui lòng gửi CV về tuyendung@greenfood.vn`)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors inline-flex items-center gap-1 w-full lg:w-auto justify-center"
                  >
                    Ứng tuyển <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-emerald-50 rounded-xl p-6 mt-10 border border-emerald-100 text-center">
          <p className="text-sm text-gray-700">
            Chưa tìm thấy vị trí phù hợp? Hãy gửi CV chủ động của bạn tới email: <a href="mailto:tuyendung@greenfood.vn" className="text-emerald-700 font-bold hover:underline">tuyendung@greenfood.vn</a>. GreenFood luôn chào đón các nhân tài cùng chí hướng!
          </p>
        </div>
      </div>
    </div>
  );
}

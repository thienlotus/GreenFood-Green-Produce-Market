"use client";

import Link from 'next/link';
import { ChevronRight, Leaf, Heart, Globe, Users, ShoppingCart, MapPin, Award, TrendingUp, Target, Eye, Sprout } from 'lucide-react';

export default function AboutPage() {
  const milestones = [
    { year: '2020', title: 'Khởi nguồn ý tưởng', desc: 'Ý tưởng kết nối nông hộ sạch với người tiêu dùng đô thị ra đời từ mùa COVID-19.' },
    { year: '2021', title: 'Ra mắt GreenFood v1', desc: 'Phiên bản đầu tiên với 3 nông hộ liên kết tại Bến Tre và Lâm Đồng.' },
    { year: '2022', title: 'Mở rộng toàn quốc', desc: 'Mở rộng mạng lưới lên 4 vùng miền, tích hợp bản đồ GIS nhà vườn.' },
    { year: '2023', title: 'Chứng nhận VietGAP', desc: '100% sản phẩm đạt chuẩn VietGAP, được Bộ NN&PTNT công nhận.' },
    { year: '2024', title: 'Công nghệ AI & Truy xuất', desc: 'Tích hợp truy xuất nguồn gốc blockchain và AI gợi ý sản phẩm theo mùa.' },
    { year: '2025', title: 'Hệ sinh thái hoàn chỉnh', desc: 'Vận hành hệ sinh thái nông sản sạch lớn nhất Việt Nam với 6+ nông hộ đối tác.' },
  ];

  const stats = [
    { icon: Users, value: '6+', label: 'Nông hộ đối tác', color: 'text-emerald-600 bg-emerald-50' },
    { icon: ShoppingCart, value: '12+', label: 'Sản phẩm chất lượng', color: 'text-amber-600 bg-amber-50' },
    { icon: MapPin, value: '4', label: 'Vùng miền phủ sóng', color: 'text-blue-600 bg-blue-50' },
    { icon: Award, value: '100%', label: 'Đạt chuẩn VietGAP', color: 'text-rose-600 bg-rose-50' },
  ];

  const values = [
    { icon: Leaf, title: 'Xanh & Sạch', desc: 'Cam kết 100% sản phẩm đạt chuẩn VietGAP, không thuốc trừ sâu, không chất bảo quản.' },
    { icon: Heart, title: 'Tận Tâm', desc: 'Mỗi sản phẩm đều mang câu chuyện và tâm huyết của người nông dân Việt.' },
    { icon: Globe, title: 'Bền Vững', desc: 'Phát triển nông nghiệp bền vững, bảo vệ môi trường và cộng đồng nông thôn.' },
    { icon: TrendingUp, title: 'Đổi Mới', desc: 'Ứng dụng công nghệ hiện đại vào chuỗi cung ứng nông sản từ vườn đến bàn ăn.' },
  ];

  const team = [
    { name: 'Nguyễn Minh Quang', role: 'CEO & Founder', avatar: '👨‍💼', desc: 'Cựu kỹ sư nông nghiệp, 10 năm kinh nghiệm trong chuỗi cung ứng thực phẩm.' },
    { name: 'Trần Thị Hạnh', role: 'COO', avatar: '👩‍💼', desc: 'Chuyên gia quản trị vận hành, từng điều hành chuỗi siêu thị nông sản.' },
    { name: 'Lê Hoàng Đức', role: 'CTO', avatar: '👨‍💻', desc: 'Full-stack developer, đam mê ứng dụng AI vào nông nghiệp thông minh.' },
    { name: 'Phạm Ngọc Ánh', role: 'Head of Marketing', avatar: '👩‍🎨', desc: 'Sáng tạo nội dung, xây dựng thương hiệu nông sản Việt ra thế giới.' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 lg:px-8 py-20 relative z-10">
          <div className="flex items-center text-sm text-emerald-200 mb-6 gap-1">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">Về GreenFood</span>
          </div>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
              <Sprout size={16} className="text-emerald-300" />
              <span>Từ Nông Trại Đến Bàn Ăn</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Câu Chuyện <span className="text-amber-400">GreenFood</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 leading-relaxed max-w-2xl">
              GreenFood ra đời với sứ mệnh kết nối trực tiếp người nông dân Việt Nam với người tiêu dùng, 
              mang nông sản sạch, tươi ngon từ vườn đến bàn ăn mỗi gia đình.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="container mx-auto px-4 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-shadow">
              <div className={`w-14 h-14 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                <stat.icon size={24} />
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="container mx-auto px-4 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 md:p-10 border border-emerald-100">
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6">
              <Eye size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tầm Nhìn</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Trở thành nền tảng thương mại điện tử nông sản sạch hàng đầu Việt Nam, 
              nơi mỗi sản phẩm đều có thể truy xuất nguồn gốc minh bạch, 
              góp phần xây dựng nền nông nghiệp bền vững và nâng cao đời sống nông dân.
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 md:p-10 border border-amber-100">
            <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-6">
              <Target size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sứ Mệnh</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Xóa bỏ trung gian, kết nối trực tiếp nông hộ với người tiêu dùng. 
              Đảm bảo nông sản tươi ngon, giá cả hợp lý, 
              đồng thời tăng thu nhập cho người nông dân và bảo vệ sức khỏe cộng đồng.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container mx-auto px-4 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Giá Trị Cốt Lõi</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Bốn trụ cột tạo nên bản sắc và sức mạnh của GreenFood</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <v.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-white border-t border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Hành Trình Phát Triển</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Từ ý tưởng nhỏ đến hệ sinh thái nông sản sạch</p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-emerald-200 -translate-x-1/2 hidden md:block"></div>
            {milestones.map((m, idx) => (
              <div key={idx} className={`flex flex-col md:flex-row items-center gap-6 mb-12 ${idx % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow inline-block">
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{m.year}</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2">{m.title}</h3>
                    <p className="text-gray-500 text-sm">{m.desc}</p>
                  </div>
                </div>
                <div className="w-4 h-4 bg-emerald-500 rounded-full border-4 border-emerald-100 shrink-0 z-10 hidden md:block"></div>
                <div className="flex-1 hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-4 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Đội Ngũ Sáng Lập</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Những con người tâm huyết đứng sau GreenFood</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">{member.avatar}</div>
              <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
              <p className="text-emerald-600 font-semibold text-sm mb-3">{member.role}</p>
              <p className="text-gray-500 text-sm">{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Cùng GreenFood xây dựng nền nông nghiệp sạch</h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
            Mỗi đơn hàng của bạn là một bước tiến cho nông nghiệp bền vững Việt Nam.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-md">
              Mua sắm ngay
            </Link>
            <Link href="/farmers" className="bg-white/10 backdrop-blur-sm text-white font-bold px-8 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/20">
              Khám phá nông hộ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

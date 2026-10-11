<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductReview;
use App\Models\Product;

class ProductReviewSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        if ($products->isEmpty()) {
            return;
        }

        $sampleReviews = [
            [
                'user_name' => 'nguyen_hoang_anh92',
                'user_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
                'rating' => 5,
                'comment' => "Sản phẩm quá tuyệt vời luôn mọi người ơi! Nhận hàng mà bất ngờ vì độ tươi rói của nông sản, cùi dày hạt lép béo ngậy chuẩn chỉ. Đóng gói thùng xốp giữ nhiệt cẩn thận, có kèm đá khô. Sẽ ủng hộ shop dài dài!",
                'variant_info' => 'Hộp 1kg (Cơm sầu riêng vàng ươm)',
                'product_quality' => 'Xuất sắc, chuẩn VietGAP tươi ngon',
                'match_description' => '100% đúng với mô tả từ nhà vườn',
                'taste_experience' => 'Vị ngọt đậm đà, béo ngậy khó cưỡng',
                'video_url' => 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
                'video_thumbnail' => 'https://images.unsplash.com/photo-1587393855524-087f83d95bc9?q=80&w=600&auto=format&fit=crop',
                'video_duration' => '0:18',
                'images' => [
                    'https://images.unsplash.com/photo-1587393855524-087f83d95bc9?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop'
                ],
                'tags' => ['Rau củ rất tươi', 'Đóng gói cẩn thận', 'Giao nhanh 2h', 'Đúng với mô tả'],
                'likes_count' => 46,
                'seller_reply' => 'GreenFood xin chân thành cảm ơn bạn Hoàng Anh đã ủng hộ nhà vườn! Chúc bạn và gia đình thưởng thức thật ngon miệng ạ ❤️',
                'seller_reply_at' => now()->subDays(2),
                'is_verified_purchase' => true,
                'is_anonymous' => false,
            ],
            [
                'user_name' => 'thanh_truc_dalat',
                'user_avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
                'rating' => 5,
                'comment' => "Quay video unbox cho mọi người xem trực tiếp độ tươi luôn này! Cầm trái trên tay thơm lừng cả phòng, mở ra cơm vàng hạt lép đúng chuẩn loại 1. Mua online mà chất lượng xịn hơn cả mua ngoài sạp.",
                'variant_info' => 'Hộp 500g (Tuyển chọn cao cấp)',
                'product_quality' => 'Tươi mới thu hoạch trong ngày',
                'match_description' => 'Hình chụp thực tế thế nào giao y vậy',
                'taste_experience' => 'Mềm mịn dẻo quánh, không bị sượng',
                'video_url' => 'https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b5/Slow_Motion_Salad_-_Sony_FS700.webm/Slow_Motion_Salad_-_Sony_FS700.webm.480p.vp9.webm',
                'video_thumbnail' => 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=600&auto=format&fit=crop',
                'video_duration' => '0:26',
                'images' => [
                    'https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=800&auto=format&fit=crop'
                ],
                'tags' => ['Chuẩn VietGAP', 'Nhà vườn uy tín', 'Giao nhanh 2h'],
                'likes_count' => 31,
                'seller_reply' => 'Dạ GreenFood cảm ơn chị Thanh Trúc rất nhiều! Sự hài lòng của khách hàng là động lực lớn nhất của bà con nông dân ạ!',
                'seller_reply_at' => now()->subDays(3),
                'is_verified_purchase' => true,
                'is_anonymous' => false,
            ],
            [
                'user_name' => 'm*****9',
                'user_avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
                'rating' => 5,
                'comment' => "Giao hỏa tốc đúng 90 phút là shipper tới cửa nhà rồi. Rau quả bọc màng thở chuyên dụng nên không hề bị dập hay úa tí nào. Đã test độ ngọt rất vừa ý, vote 5 sao và tiếp tục đặt cho gia đình.",
                'variant_info' => 'Túi 2kg (Combo Tiết Kiệm)',
                'product_quality' => 'Tươi xanh mơn mởn, sạch sẽ',
                'match_description' => 'Chuẩn chỉ 100%',
                'taste_experience' => 'Ngọt mát thanh khiết',
                'video_url' => 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d1/Fresh_Salad_%F0%9F%A5%97_Video.webm/Fresh_Salad_%F0%9F%A5%97_Video.webm.480p.vp9.webm',
                'video_thumbnail' => 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop',
                'video_duration' => '0:32',
                'images' => [
                    'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=800&auto=format&fit=crop'
                ],
                'tags' => ['Rau củ rất tươi', 'Đóng gói cẩn thận', 'Shipper thân thiện'],
                'likes_count' => 19,
                'seller_reply' => 'GreenFood xin cảm ơn quý khách! Chúc quý khách những bữa ăn gia đình tràn ngập dinh dưỡng và niềm vui!',
                'seller_reply_at' => now()->subDay(),
                'is_verified_purchase' => true,
                'is_anonymous' => true,
            ],
            [
                'user_name' => 'le_van_thanh_q1',
                'user_avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
                'rating' => 5,
                'comment' => "Lần đầu mua nông sản online mà ưng bụng thế này. Trái cây tươi như vừa hái tại vườn Đà Lạt/Bến Tre vậy. Mua làm quà biếu bố mẹ ai cũng khen nức nở. Đóng hộp quà sang xịn mịn.",
                'variant_info' => 'Hộp 1kg (Loại Đặc Biệt)',
                'product_quality' => 'Hàng tuyển chọn loại 1',
                'match_description' => 'Chính xác như quảng cáo',
                'taste_experience' => 'Đậm đà hương vị quê hương',
                'video_url' => null,
                'video_thumbnail' => null,
                'video_duration' => null,
                'images' => [
                    'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=800&auto=format&fit=crop'
                ],
                'tags' => ['Thích hợp làm quà biếu', 'Đóng gói sang trọng'],
                'likes_count' => 12,
                'seller_reply' => 'Cảm ơn anh Thành! GreenFood luôn nỗ lực để mang đến nông sản sạch tinh hoa nhất cho mâm cơm Việt ạ!',
                'seller_reply_at' => now()->subDays(4),
                'is_verified_purchase' => true,
                'is_anonymous' => false,
            ],
            [
                'user_name' => 'bich_ngoc_sg',
                'user_avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
                'rating' => 4,
                'comment' => "Chất lượng rất ngon, ngọt thơm. Shipper giao tới hơi trễ 10 phút do trời mưa to nhưng có gọi điện xin lỗi trước rất lịch sự. Nói chung vẫn cho shop 5 sao chất lượng, trừ xíu điểm thời tiết thôi nè.",
                'variant_info' => 'Gói tiêu chuẩn 1kg',
                'product_quality' => 'Ngon, tươi rói',
                'match_description' => 'Đúng miêu tả',
                'taste_experience' => 'Rất vừa miệng',
                'video_url' => null,
                'video_thumbnail' => null,
                'video_duration' => null,
                'images' => [],
                'tags' => ['Rau củ rất tươi', 'Tư vấn nhiệt tình'],
                'likes_count' => 8,
                'seller_reply' => 'Dạ GreenFood xin lỗi bạn Ngọc vì sự chậm trễ do thời tiết xấu ạ. Lần sau shop sẽ gửi tặng voucher ưu đãi bù đắp nha!',
                'seller_reply_at' => now()->subDays(5),
                'is_verified_purchase' => true,
                'is_anonymous' => false,
            ]
        ];

        foreach ($products as $product) {
            foreach ($sampleReviews as $rev) {
                ProductReview::create(array_merge($rev, [
                    'product_id' => $product->id,
                ]));
            }
        }
    }
}

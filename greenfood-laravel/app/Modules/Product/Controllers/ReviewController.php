<?php

namespace App\Modules\Product\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReviewController extends Controller
{
    /**
     * Lấy danh sách đánh giá kèm thống kê chuẩn Shopee
     */
    public function index(Request $request, $productId)
    {
        // Kiểm tra theo ID hoặc Slug
        $product = Product::where('id', $productId)->orWhere('slug', $productId)->first();
        $targetId = $product ? $product->id : $productId;

        $query = ProductReview::where(function ($q) use ($targetId, $productId) {
            $q->where('product_id', $targetId)
              ->orWhere('product_id', $productId);
        });

        // Thống kê tổng quan Shopee
        $allReviews = (clone $query)->get();
        $total = $allReviews->count();
        $avgRating = $total > 0 ? round($allReviews->avg('rating'), 1) : 5.0;

        $stats = [
            'total' => $total,
            'avg_rating' => $avgRating,
            'stars_count' => [
                5 => $allReviews->where('rating', 5)->count(),
                4 => $allReviews->where('rating', 4)->count(),
                3 => $allReviews->where('rating', 3)->count(),
                2 => $allReviews->where('rating', 2)->count(),
                1 => $allReviews->where('rating', 1)->count(),
            ],
            'has_media_count' => $allReviews->filter(function ($r) {
                return !empty($r->video_url) || (!empty($r->images) && count($r->images) > 0);
            })->count(),
            'has_video_count' => $allReviews->whereNotNull('video_url')->where('video_url', '!=', '')->count(),
            'has_comment_count' => $allReviews->whereNotNull('comment')->where('comment', '!=', '')->count(),
        ];

        // Lọc theo tabs Shopee
        if ($request->has('rating') && is_numeric($request->rating)) {
            $query->where('rating', intval($request->rating));
        }

        if ($request->boolean('has_video')) {
            $query->whereNotNull('video_url')->where('video_url', '!=', '');
        }

        if ($request->boolean('has_media')) {
            $query->where(function ($q) {
                $q->whereNotNull('video_url')->where('video_url', '!=', '')
                  ->orWhereNotNull('images');
            });
        }

        // Sắp xếp
        $sortBy = $request->get('sort', 'newest');
        if ($sortBy === 'helpful') {
            $query->orderBy('likes_count', 'desc')->latest();
        } else {
            $query->latest();
        }

        $reviews = $query->paginate($request->get('limit', 15));

        return response()->json([
            'success' => true,
            'stats' => $stats,
            'data' => $reviews->items(),
            'pagination' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ]
        ]);
    }

    /**
     * Thêm mới đánh giá sản phẩm (Có hỗ trợ video & hình ảnh)
     */
    public function store(Request $request, $productId)
    {
        $validated = $request->validate([
            'user_name' => 'required|string|max:100',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:2000',
            'variant_info' => 'nullable|string|max:100',
            'product_quality' => 'nullable|string|max:255',
            'match_description' => 'nullable|string|max:255',
            'taste_experience' => 'nullable|string|max:255',
            'video_url' => 'nullable|string',
            'video_thumbnail' => 'nullable|string',
            'video_duration' => 'nullable|string|max:20',
            'images' => 'nullable|array',
            'tags' => 'nullable|array',
            'is_anonymous' => 'nullable|boolean',
        ]);

        $product = Product::where('id', $productId)->orWhere('slug', $productId)->first();
        $targetId = $product ? $product->id : $productId;

        $review = ProductReview::create([
            'product_id' => $targetId,
            'user_id' => $request->user()?->id ?? null,
            'user_name' => $validated['user_name'],
            'user_avatar' => $request->input('user_avatar') ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'variant_info' => $validated['variant_info'] ?? 'Mặc định',
            'product_quality' => $validated['product_quality'] ?? 'Đúng chuẩn nông sản tươi sạch VietGAP',
            'match_description' => $validated['match_description'] ?? '100% giống hình chụp thực tế',
            'taste_experience' => $validated['taste_experience'] ?? null,
            'video_url' => $validated['video_url'] ?? null,
            'video_thumbnail' => $validated['video_thumbnail'] ?? null,
            'video_duration' => $validated['video_duration'] ?? '0:15',
            'images' => $validated['images'] ?? [],
            'tags' => $validated['tags'] ?? ['Rau củ rất tươi', 'Đóng gói cẩn thận', 'Giao nhanh 2h'],
            'likes_count' => 0,
            'seller_reply' => 'Dạ GreenFood và nhà vườn chân thành cảm ơn bạn đã tin yêu và ủng hộ nông sản quê hương ạ! Chúc bạn và gia đình thật nhiều sức khỏe!',
            'seller_reply_at' => now(),
            'is_verified_purchase' => true,
            'is_anonymous' => $validated['is_anonymous'] ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đánh giá đã được gửi thành công! Bạn nhận được +200 GreenXu tích lũy.',
            'data' => $review,
            'reward' => [
                'green_xu' => 200,
                'voucher_code' => 'GREENREVIEW10'
            ]
        ], 201);
    }

    /**
     * Tăng lượt thích / hữu ích
     */
    public function toggleLike($id)
    {
        $review = ProductReview::findOrFail($id);
        $review->increment('likes_count');

        return response()->json([
            'success' => true,
            'likes_count' => $review->likes_count
        ]);
    }

    /**
     * Upload Video hoặc Ảnh review (hỗ trợ multipart/form-data)
     */
    public function uploadMedia(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:51200', // Tối đa 50MB
        ]);

        $file = $request->file('file');
        $mime = $file->getMimeType();
        $isMovie = Str::startsWith($mime, 'video/');

        $folder = $isMovie ? 'reviews/videos' : 'reviews/images';
        $filename = Str::random(20) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $filename, 'public');

        // Sao chép trực tiếp vào các thư mục public để web server phục vụ tĩnh ngay lập tức
        $sourceFile = storage_path('app/public/' . $folder . '/' . $filename);
        $publicDestinations = [
            public_path('storage/' . $folder),
            base_path('domains/greenfood.asia/public_html/storage/' . $folder),
            base_path('domains/greenfood.asia/storage/' . $folder),
            '/home/ajmylihnhosting/domains/greenfood.asia/public_html/storage/' . $folder,
            '/home/ajmylihnhosting/domains/greenfood.asia/storage/' . $folder,
            '/home/ajmylihnhosting/public_html/storage/' . $folder,
        ];

        if (file_exists($sourceFile)) {
            foreach ($publicDestinations as $destDir) {
                try {
                    if (!is_dir($destDir)) {
                        @mkdir($destDir, 0755, true);
                    }
                    @copy($sourceFile, $destDir . '/' . $filename);
                } catch (\Throwable $t) {}
            }
        }

        $url = asset('storage/' . $path);

        return response()->json([
            'success' => true,
            'url' => $url,
            'type' => $isMovie ? 'video' : 'image',
            'mime' => $mime,
        ]);
    }
}

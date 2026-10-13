"use client";

import { useState, useRef } from 'react';
import {
  X, Star, Video, Image as ImageIcon, Trash2, Upload,
  Gift, Check, AlertCircle, Play, Pause, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { submitProductReview, uploadReviewMediaApi } from '@/lib/api';
import { ProductReviewItem, SubmitReviewPayload } from '@/types/review';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  variants: { id: string; unit: string }[];
  onReviewSubmitted: (newReview: ProductReviewItem) => void;
}

const RATING_LABELS: Record<number, { text: string; emoji: string }> = {
  1: { text: 'Cực kỳ thất vọng', emoji: '😡' },
  2: { text: 'Không hài lòng', emoji: '🙁' },
  3: { text: 'Bình thường', emoji: '😐' },
  4: { text: 'Hài lòng', emoji: '😊' },
  5: { text: 'Tuyệt vời! Rất ưng ý', emoji: '😍' },
};

const SUGGESTED_TAGS = [
  'Rau củ rất tươi ngon',
  'Đóng gói cẩn thận',
  'Giao hàng siêu nhanh 2h',
  'Đúng với mô tả 100%',
  'Nhà vườn nhiệt tình',
  'Chuẩn VietGAP an toàn',
  'Hương vị đậm đà'
];

export default function WriteReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  variants,
  onReviewSubmitted
}: WriteReviewModalProps) {
  const { user } = useAuthStore();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(variants[0]?.unit || 'Hộp 1kg');
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Rau củ rất tươi ngon', 'Đóng gói cẩn thận']);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reviewerName, setReviewerName] = useState(user?.name || 'Khách hàng GreenFood');

  // Video State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Photos State
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Vui lòng chọn định dạng video hợp lệ (.mp4, .webm, .mov)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Kích thước video tối đa là 50MB');
      return;
    }

    setVideoFile(file);
    const objUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objUrl);
    toast.success('Đã tải lên video review thành công!');
  };

  const removeVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handlePhotosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 5 - photoFiles.length;
    if (remainingSlots <= 0) {
      toast.error('Tối đa 5 hình ảnh cho mỗi đánh giá');
      return;
    }

    const accepted = files.slice(0, remainingSlots);
    const newUrls = accepted.map(f => URL.createObjectURL(f));

    setPhotoFiles(prev => [...prev, ...accepted]);
    setPhotoPreviewUrls(prev => [...prev, ...newUrls]);
    toast.success(`Đã thêm ${accepted.length} ảnh review`);
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 5) {
      toast.error('Vui lòng viết ít nhất 5 ký tự chia sẻ cảm nhận của bạn');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalVideoUrl: string | null = null;
      let finalPhotoUrls: string[] = [];

      // 1. Upload video if selected
      if (videoFile) {
        const uploadRes = await uploadReviewMediaApi(videoFile);
        finalVideoUrl = uploadRes?.url || videoPreviewUrl;
      }

      // 2. Upload photos
      for (const pFile of photoFiles) {
        const pRes = await uploadReviewMediaApi(pFile);
        if (pRes?.url) {
          finalPhotoUrls.push(pRes.url);
        }
      }

      // 3. Chuẩn bị payload
      const payload: SubmitReviewPayload = {
        productId,
        userName: reviewerName || user?.name || 'Khách hàng GreenFood',
        userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        rating,
        comment: comment.trim(),
        variantInfo: selectedVariant,
        productQuality: 'Xuất sắc, chuẩn VietGAP tươi ngon',
        matchDescription: '100% đúng với mô tả từ nhà vườn',
        tasteExperience: 'Rất vừa vị giác gia đình',
        videoUrl: finalVideoUrl,
        videoThumbnail: finalPhotoUrls[0] || 'https://images.unsplash.com/photo-1587393855524-087f83d95bc9?q=80&w=600&auto=format&fit=crop',
        videoDuration: videoFile ? '0:20' : null,
        images: finalPhotoUrls,
        tags: selectedTags,
        isAnonymous,
      };

      const res = await submitProductReview(productId, payload);
      if (res.success && res.data) {
        toast.success('🎉 Đánh giá thành công! Bạn nhận được +200 GreenXu!');
        onReviewSubmitted(res.data);
        onClose();
      } else {
        toast.error(res.message || 'Không thể đăng đánh giá, vui lòng thử lại');
      }
    } catch (err) {
      console.error('Submit review error:', err);
      toast.error('Đã xảy ra lỗi khi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 to-teal-50/70">
          <div>
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <span>Đánh Giá & Video Review</span>
              <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Gift size={12} /> +200 Xu
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-md">
              Sản phẩm: <strong className="text-gray-800">{productName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Incentive Banner Shopee style */}
        <div className="bg-amber-50/80 border-b border-amber-200/60 px-6 py-2.5 flex items-center gap-2 text-amber-900 text-xs font-medium">
          <Sparkles size={16} className="text-amber-600 shrink-0" />
          <span>
            Đăng <strong>Video Review</strong> kèm hình ảnh thực tế để tích lũy <strong>200 GreenXu</strong> và nhận Voucher giảm 10% cho lần mua tiếp theo!
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* 1. Chọn mức sao */}
          <div className="text-center py-2 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Chất lượng sản phẩm
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-hidden cursor-pointer"
                >
                  <Star
                    size={36}
                    className={`transition-colors ${
                      star <= activeRating
                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm font-bold text-emerald-800 flex items-center justify-center gap-1.5">
              <span>{RATING_LABELS[activeRating]?.emoji}</span>
              <span>{RATING_LABELS[activeRating]?.text}</span>
            </div>
          </div>

          {/* 2. Chọn phân loại đã mua */}
          {variants.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Phân loại sản phẩm đã mua:
              </label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    type="button"
                    key={v.id}
                    onClick={() => setSelectedVariant(v.unit)}
                    className={`text-xs px-3.5 py-2 rounded-xl font-semibold border-2 transition-all cursor-pointer ${
                      selectedVariant === v.unit
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-gray-200 text-gray-600 hover:border-emerald-300 bg-white'
                    }`}
                  >
                    {v.unit}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Tiêu chí nhanh (Tags Shopee) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Điểm bạn hài lòng nhất:
            </label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {isSelected && <Check size={12} />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Nội dung đánh giá */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Cảm nhận chi tiết của bạn: <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm về độ tươi, mùi vị, độ ngọt, bao bì đóng gói và thời gian giao hàng nhé..."
              className="w-full text-sm p-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-hidden transition-all placeholder:text-gray-400 bg-gray-50/50"
            />
            <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1">
              <span>Tối thiểu 5 ký tự</span>
              <span>{comment.length}/2000</span>
            </div>
          </div>

          {/* 5. TẢI LÊN VIDEO REVIEW (Đặc trưng Shopee) */}
          <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Video size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">
                    Video Review thực tế (Shopee Style)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Quay cận cảnh sản phẩm, unbox hoặc thưởng thức (tối đa 50MB)
                  </p>
                </div>
              </div>

              {!videoFile && (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <Upload size={14} /> Thêm Video
                </button>
              )}
            </div>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleVideoSelect}
            />

            {/* Video Preview Player */}
            {videoPreviewUrl && (
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video max-h-56 flex items-center justify-center border border-emerald-200 shadow-md">
                <video
                  ref={previewVideoRef}
                  src={videoPreviewUrl}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                />
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  title="Xóa video"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>

          {/* 6. TẢI LÊN HÌNH ẢNH REVIEW */}
          <div className="border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Hình ảnh chụp thực tế</h4>
                  <p className="text-[11px] text-gray-500">Tối đa 5 hình ảnh ({photoFiles.length}/5)</p>
                </div>
              </div>

              {photoFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Upload size={14} /> Chọn ảnh
                </button>
              )}
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotosSelect}
            />

            {photoPreviewUrls.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mt-2">
                {photoPreviewUrls.map((url, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-2xs group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. Thông tin người gửi & Ẩn danh */}
          <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-gray-800 block">Tên người đánh giá:</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="mt-1 text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                />
                <span className="text-xs text-gray-700 font-medium select-none">
                  Hiển thị ẩn danh (ví dụ: n*****9)
                </span>
              </label>
            </div>
          </div>

          {/* Nút gửi đánh giá */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-950/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Đang tải lên video & đánh giá...</span>
              ) : (
                <>
                  <Check size={18} />
                  <span>Hoàn tất & Nhận +200 GreenXu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

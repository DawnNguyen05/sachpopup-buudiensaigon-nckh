1. NHẠC NỀN (BGM - Background Music phát lặp lại liên tục từ trang 1):
  - Hãy đặt file nhạc nền vào: public/audio/bgm.mp3
  - Bạn có thể chỉnh đường dẫn hoặc âm lượng nhạc nền trong file public/data/stories.json:
      "bgm": "/audio/bgm.mp3",
      "bgmVolume": 0.35
    (Âm lượng từ 0.1 đến 1.0; mặc định để 0.35 để nhạc nền êm dịu, không lấn át tiếng giọng đọc người dẫn).

2. ÂM THANH GIỌNG ĐỌC NGƯỜI DẪN (Từng trang):
  - public/audio/SoundTrang1.mp3  (Giọng đọc trang 1)
  - public/audio/trang-2.mp3      (Giọng đọc trang 2)
  - public/audio/trang-3.mp3      (Giọng đọc trang 3)
  - public/audio/trang-4.mp3      (Giọng đọc trang 4)

3. CHỈNH SỐ GIÂY TỰ PHÁT LỜI DẪN:
  Mở public/data/stories.json, mỗi trang có dòng:
    "audioStartAt": 2
  (Ví dụ: 2 là khi video trang đó chạy đến giây thứ 2 thì giọng đọc bắt đầu phát).

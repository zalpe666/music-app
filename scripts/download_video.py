import sys
import yt_dlp
import os

def download_video(youtube_url, output_dir, song_id):
    # Pastikan folder tujuan ada
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Nama file menggunakan ID lagu agar mudah di-tracking
    file_name = f"{song_id}.%(ext)s"
    
    ydl_opts = {
        'outtmpl': f'{output_dir}/{file_name}',
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', # Paksa format mp4
        'merge_output_format': 'mp4',
        'quiet': True,
        'no_warnings': True
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([youtube_url])
            # Mengembalikan nama file yang berhasil didownload (misal: 1.mp4)
            print(f"{song_id}.mp4") 
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("ERROR: Argumen tidak lengkap (butuh: URL, OutputDir, SongID)")
        sys.exit(1)
        
    url = sys.argv[1]
    out_dir = sys.argv[2]
    song_id = sys.argv[3]
    
    download_video(url, out_dir, song_id)
import subprocess
import sys
import json
import math
import wave
import os
import tempfile


def get_audio_data(file_path):
    temp_wav = tempfile.mktemp(suffix=".wav")

    try:
        # Ambil maksimal 30 detik pertama
        command = [
            "ffmpeg",
            "-y",
            "-i", file_path,
            "-t", "30",
            "-ac", "1",
            "-ar", "22050",
            "-f", "wav",
            temp_wav
        ]

        result = subprocess.run(
            command,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE
        )

        if result.returncode != 0:
            raise Exception(result.stderr.decode())

        with wave.open(temp_wav, "rb") as wav:
            frames = wav.readframes(wav.getnframes())
            sample_rate = wav.getframerate()

        return frames, sample_rate

    finally:
        if os.path.exists(temp_wav):
            os.remove(temp_wav)


def calculate_energy(frames):
    import struct

    samples = struct.unpack(
        "<" + "h" * (len(frames) // 2),
        frames
    )

    if not samples:
        return 0

    # RMS
    rms = math.sqrt(
        sum(sample * sample for sample in samples)
        / len(samples)
    )

    # Normalisasi sederhana 0 - 1
    energy = min(rms / 32768 * 2, 1.0)

    return round(energy, 3)


def calculate_bpm(file_path):
    """
    Gunakan FFmpeg astats + tempo detection sederhana.
    """

    command = [
        "ffmpeg",
        "-i", file_path,
        "-af", "ebur128=peak=true",
        "-f", "null",
        "-"
    ]

    subprocess.run(
        command,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE
    )

    # Default sementara
    # Akan kita tingkatkan dengan BPM detector
    return 0


def analyze_audio(file_path):

    if not os.path.exists(file_path):
        return {
            "success": False,
            "error": "File tidak ditemukan"
        }

    try:
        frames, sample_rate = get_audio_data(file_path)

        energy = calculate_energy(frames)

        # Untuk sementara BPM 0
        bpm = calculate_bpm(file_path)

        return {
            "success": True,
            "tempo": bpm,
            "energy": energy
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":

    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "No file path provided"
        }))
        sys.exit(1)

    result = analyze_audio(sys.argv[1])

    print(json.dumps(result))
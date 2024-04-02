import os
import sys
import json
import asyncio
import requests
import subprocess
import urllib.parse

# Activate venv
os.system(".\\venv\\Scripts\\activate")

from uuid import uuid4
from typing import List
from datetime import datetime
from libgen_api import LibgenSearch

try:
    import edge_tts

    from gtts import gTTS
    from tika import parser
    from moviepy.editor import *
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.webdriver import WebDriver
except ImportError:
    # Install without output
    s = subprocess.Popen(["pip", "install", "-r", "requirements.txt"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    s.wait()
    import edge_tts

    from gtts import gTTS
    from tika import parser
    from moviepy.editor import *
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.webdriver import WebDriver

LOG_FILE = "logs/" + datetime.now().strftime("%Y-%m-%d_%H-%M-%S") + ".log"
VOICE = "en-GB-SoniaNeural"

class Logger:
    def __init__(self, log_file: str):
        self.log_file = log_file

    def log(self, message: str):
        with open(self.log_file, "a") as f:
            f.write(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - {message}\n")

l = Logger(LOG_FILE)

ALLOWED_TTS_ENGINES = ["edge", "google", "elevenlabs"]

def _generate_random_filename(dir: str, ext: str = "mp3") -> str:
    """
    Generates a random filename with the given extension in the given directory.

    :param dir: The directory to save the file in.
    :param ext: The extension of the file.
    :return: The generated filename.
    """
    if ext:
        return os.path.join(dir, f"{uuid4()}.{ext}")
    else:
        return os.path.join(dir, str(uuid4()))
    
async def _do_edge_tts(text: str) -> str:
    """
    Converts text to speech using Microsoft Edge.

    :param text: The text to convert to speech.
    :return: The path to the generated audio file.
    """
    l.log("Starting Microsoft Edge for TTS")
    edge = edge_tts.Communicate(text)

    audio_file = _generate_random_filename("audio")
    await edge.save(audio_file)

    return audio_file

def _do_tts(text: str, engine: str = "edge") -> str:
    """
    Converts text to speech using the given engine.

    :param text: The text to convert to speech.
    :param engine: The engine to use for text-to-speech.
    :return: The path to the generated audio file.
    """
    if engine not in ALLOWED_TTS_ENGINES:
        raise ValueError("Invalid TTS engine")

    if engine == "edge":
        l.log("Using Microsoft Edge for TTS")
        loop = asyncio.get_event_loop()
        audio_file = loop.run_until_complete(_do_edge_tts(text))
        return audio_file

    elif engine == "google":
        l.log("Using Google for TTS")
        tts = gTTS(text)
        audio_file = _generate_random_filename("audio")
        tts.save(audio_file)
        return audio_file

    elif engine == "elevenlabs":
        l.log("Using Eleven Labs for TTS")
        l.log("[ERR] Eleven Labs TTS is not yet implemented")

def _get_downloads_folder() -> str:
    """
    Gets the downloads folder for the current operating system.

    :return: The downloads folder.
    """
    if sys.platform == "win32":
        l.log("Windows operating system detected")
        return os.path.join(os.environ["USERPROFILE"], "Downloads")
    elif sys.platform == "darwin":
        l.log("macOS operating system detected")
        return os.path.join(os.environ["HOME"], "Downloads")
    elif sys.platform == "linux":
        l.log("Linux operating system detected")
        return os.path.join(os.environ["HOME"], "Downloads")
    else:
        raise OSError("Unsupported operating system")

def fetch_books(query: str) -> List[dict]:
    """
    Fetches books from Libgen based on the given query.

    :param query: The query to search for.
    :return: A list of books that match the query.
    """
    s = LibgenSearch()
    results = s.search_title(query)

    l.log(f"Found {len(results)} books for query '{query}'")

    return json.dumps(results).strip()

def encode_uri_component(uri: str) -> str:
    """
    Encodes a URI component.

    :param uri: The URI to encode.
    :return: The encoded URI.
    """
    l.log(f"Encoding URI component '{uri}'")
    return urllib.parse.quote(uri)

def read_book(path: str, engine: str = "edge") -> str:
    """
    Reads a book using text-to-speech.

    :param path: The path to the book to read.
    :param engine: The engine to use for text-to-speech.
    :return: The path to the generated audio file.
    """
    raw = parser.from_file(path)
    text = raw["content"]

    l.log(f"Reading book from '{path}'")

    chunks = [text[i:i + 500] for i in range(0, len(text), 500)]

    audio_files = []

    for chunk in chunks:
        audio_file = _do_tts(chunk, engine)
        audio_files.append(audio_file)

    audio_clips = [AudioFileClip(audio_file) for audio_file in audio_files]
    final_audio = concatenate_audioclips(audio_clips)

    final_audio_file = _generate_random_filename("audio")
    final_audio.write_audiofile(final_audio_file)

    return final_audio_file

def download_book(title: str, book_id: str, hash: str) -> str:
    """
    Downloads a given book and returns the path to the downloaded PDF.

    :param title: The title of the book to download.
    :param book_id: The ID of the book to download.
    :param hash: The hash of the book to download.
    :return: The path to the downloaded PDF.
    """
    s = LibgenSearch()
    r = s.search_title(title)

    book = None

    with open("results.json", "w") as f:
        f.write(json.dumps(r))
        l.log(f"Saved search results to 'results.json'")

    for result in r:
        if result["ID"] == book_id:
            book = result
            l.log(f"Found book with ID '{book_id}'")
            break

    if book is None:
        return None
    
    download_links = s.resolve_download_links(book)

    download_link = download_links["GET"] or download_links["Cloudflare"]

    l.log(f"Downloading book '{title}' from '{download_link}'")

    # Download the book
    response = requests.get(download_link)

    # Save the book
    file_path = os.path.join(_get_downloads_folder(), f"{hash}.pdf")
    l.log(f"Saving book to '{file_path}'")

    with open(file_path, "wb") as f:
        f.write(response.content)

    return file_path

if __name__ == "__main__":
    action = sys.argv[1]

    if action == "fetch_books":
        # All args after the action are the query
        books = fetch_books(" ".join(sys.argv[2:]))
        print(books)

    elif action == "read_book":
        book_id = sys.argv[2]
        hash = sys.argv[3]
        title_parts = sys.argv[4:]
        title = " ".join(title_parts)

        # Download the book
        path = download_book(title, book_id, hash)

        if path is None:
            print("Failed to download book")
            sys.exit(1)

        # Read the book
        audio_file = read_book(path)
        print(audio_file)

    else:
        print("Invalid action")

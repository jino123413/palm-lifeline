"""
Generate palm-lifeline app logo variants with ComfyUI + Flux Schnell GGUF.

Output:
- palm-lifeline/public/palm-lifeline-palm_logo_v*.png
- app-logos/palm-lifeline-palm_logo_v*.png
- app-logos/palm-lifeline.png (selected final)
"""
import json
import os
import shutil
import time
import urllib.request
from pathlib import Path

COMFYUI_URL = "http://127.0.0.1:8188"
OUTPUT_DIR = Path(r"C:\Users\USER-PC\Desktop\appintoss-project\palm-lifeline\public")
APP_LOGOS_DIR = Path(r"C:\Users\USER-PC\Desktop\appintoss-project\app-logos")
COMFYUI_OUTPUT = Path(
    r"C:\Users\USER-PC\Downloads\ComfyUI_windows_portable_nvidia"
    r"\ComfyUI_windows_portable\ComfyUI\output"
)

LOGO_PROMPTS = [
    {
        "name": "palm_logo_v1",
        "seed": 99101,
        "clip_l": (
            "app icon, stylized hand palm with glowing lifeline arc, "
            "emerald green background, minimal flat vector, centered, no text"
        ),
        "t5xxl": (
            "a premium mobile app icon for palm reading, solid deep emerald background hex 1F7A3E, "
            "in the center a clean white hand palm silhouette with one elegant curved lifeline, "
            "the lifeline glows softly in mint light, "
            "minimal flat vector style, clean geometric shape, no text, no letters, no numbers, "
            "high contrast, brand-ready icon, centered composition, square format"
        ),
    },
    {
        "name": "palm_logo_v2",
        "seed": 99102,
        "clip_l": (
            "app icon, line-art palm hand, sparkling lifeline, green card-like background, "
            "simple modern icon, no text"
        ),
        "t5xxl": (
            "a modern app icon with solid green background hex 1F7A3E, "
            "white line-art palm hand centered in the icon, "
            "a highlighted life line crossing the palm with subtle mint glow, "
            "two tiny sparkles near the line, "
            "minimal flat design, clean edges, no shadows on background, no text, no typography"
        ),
    },
    {
        "name": "palm_logo_v3",
        "seed": 99103,
        "clip_l": (
            "app icon, abstract palm print with curved life path, "
            "fresh green background, elegant minimal style, no text"
        ),
        "t5xxl": (
            "a minimalist premium app icon, solid emerald green background hex 1F7A3E, "
            "abstract white palm print icon at center with one curved life path line emphasized, "
            "the life path line has a gentle luminous mint accent, "
            "clean flat vector illustration, refined, modern, highly readable at small sizes, "
            "no letters no words, no complex gradients, centered square icon"
        ),
    },
    {
        "name": "palm_logo_v4",
        "seed": 99104,
        "clip_l": (
            "app icon, palm hand + time ring motif, lifeline glow, "
            "green background, minimal luxurious icon, no text"
        ),
        "t5xxl": (
            "a polished app icon on solid emerald background hex 1F7A3E, "
            "center motif combines a white palm hand and a subtle circular time ring, "
            "one life line in the palm glows softly in mint, symbolizing life trajectory, "
            "flat clean style with premium feel, no typography, no text, square composition"
        ),
    },
]

SELECTED_VARIANT = "palm_logo_v1"


def build_txt2img_workflow(prompt_data):
    prefix = prompt_data["name"]
    return {
        "prompt": {
            "1": {
                "class_type": "UnetLoaderGGUF",
                "inputs": {"unet_name": "flux1-schnell-Q4_K_S.gguf"},
            },
            "2": {
                "class_type": "DualCLIPLoaderGGUF",
                "inputs": {
                    "clip_name1": "clip_l.safetensors",
                    "clip_name2": "t5-v1_1-xxl-encoder-Q4_K_M.gguf",
                    "type": "flux",
                },
            },
            "3": {
                "class_type": "CLIPTextEncodeFlux",
                "inputs": {
                    "clip": ["2", 0],
                    "clip_l": prompt_data["clip_l"],
                    "t5xxl": prompt_data["t5xxl"],
                    "guidance": 3.5,
                },
            },
            "4": {
                "class_type": "CLIPTextEncodeFlux",
                "inputs": {
                    "clip": ["2", 0],
                    "clip_l": "",
                    "t5xxl": "",
                    "guidance": 3.5,
                },
            },
            "5": {
                "class_type": "EmptySD3LatentImage",
                "inputs": {
                    "width": 512,
                    "height": 512,
                    "batch_size": 1,
                },
            },
            "6": {
                "class_type": "KSampler",
                "inputs": {
                    "model": ["1", 0],
                    "seed": prompt_data["seed"],
                    "steps": 4,
                    "cfg": 1.0,
                    "sampler_name": "euler",
                    "scheduler": "simple",
                    "positive": ["3", 0],
                    "negative": ["4", 0],
                    "latent_image": ["5", 0],
                    "denoise": 1.0,
                },
            },
            "7": {
                "class_type": "VAELoader",
                "inputs": {"vae_name": "ae.safetensors"},
            },
            "8": {
                "class_type": "VAEDecode",
                "inputs": {"samples": ["6", 0], "vae": ["7", 0]},
            },
            "9": {
                "class_type": "SaveImage",
                "inputs": {"images": ["8", 0], "filename_prefix": prefix},
            },
        }
    }


def queue_prompt(workflow):
    data = json.dumps(workflow).encode("utf-8")
    req = urllib.request.Request(
        f"{COMFYUI_URL}/prompt",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    return json.loads(urllib.request.urlopen(req).read())["prompt_id"]


def wait_for_completion(prompt_id, timeout=300):
    started = time.time()
    while time.time() - started < timeout:
        try:
            resp = urllib.request.urlopen(f"{COMFYUI_URL}/history/{prompt_id}")
            history = json.loads(resp.read())
            if prompt_id in history:
                status = history[prompt_id].get("status", {})
                if status.get("completed", False) or status.get("status_str") == "success":
                    return history[prompt_id]
                if status.get("status_str") == "error":
                    return None
        except Exception:
            pass
        time.sleep(2)
    return None


def find_output_file(history):
    for _, nout in history.get("outputs", {}).items():
        if "images" in nout and nout["images"]:
            return nout["images"][0].get("filename", "")
    return ""


def resize_or_copy(src, dst, width, height):
    try:
        from PIL import Image

        img = Image.open(src)
        img = img.resize((width, height), Image.LANCZOS)
        img.save(dst, "PNG", optimize=True)
        return "resized"
    except Exception:
        shutil.copy2(src, dst)
        return "copied"


def resolve_comfy_output(filename):
    direct = COMFYUI_OUTPUT / filename
    if direct.exists():
        return direct
    for sub in COMFYUI_OUTPUT.iterdir():
        candidate = sub / filename
        if sub.is_dir() and candidate.exists():
            return candidate
    return direct


def ensure_comfy_running():
    urllib.request.urlopen(f"{COMFYUI_URL}/system_stats", timeout=5).read()


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(APP_LOGOS_DIR, exist_ok=True)

    print("=== palm-lifeline logo generation ===")
    print("Checking ComfyUI...")
    ensure_comfy_running()
    print("ComfyUI ready")

    generated = []
    for prompt in LOGO_PROMPTS:
        workflow = build_txt2img_workflow(prompt)
        print(f"\n[{prompt['name']}] queue")
        prompt_id = queue_prompt(workflow)
        history = wait_for_completion(prompt_id)
        if not history:
            print(f"  fail: {prompt['name']}")
            continue

        filename = find_output_file(history)
        if not filename:
            print(f"  no output: {prompt['name']}")
            continue

        src = resolve_comfy_output(filename)
        if not src.exists():
            print(f"  file missing: {src}")
            continue

        public_dst = OUTPUT_DIR / f"palm-lifeline-{prompt['name']}.png"
        logos_dst = APP_LOGOS_DIR / f"palm-lifeline-{prompt['name']}.png"
        m1 = resize_or_copy(str(src), str(public_dst), 600, 600)
        m2 = resize_or_copy(str(src), str(logos_dst), 600, 600)

        generated.append((prompt["name"], public_dst, logos_dst))
        print(f"  saved: {public_dst.name} ({m1})")
        print(f"  saved: {logos_dst.name} ({m2})")

    selected_file = APP_LOGOS_DIR / f"palm-lifeline-{SELECTED_VARIANT}.png"
    final_file = APP_LOGOS_DIR / "palm-lifeline.png"
    if selected_file.exists():
        shutil.copy2(selected_file, final_file)
        print(f"\nselected final: {selected_file.name} -> {final_file.name}")
    else:
        print(f"\nwarning: selected variant not found: {selected_file.name}")

    print("\nDone.")


if __name__ == "__main__":
    main()

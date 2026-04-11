import argparse
import sys
from pathlib import Path

from . import paths
from . import config
from . import utils
from .vendor import download_faceforensicspp_raw

logger = utils.setup_logger(__name__)

def get_urls(server):
    if server == 'EU':
        server_url = 'http://canis.vc.in.tum.de:8100/'
    elif server == 'EU2':
        server_url = 'http://kaldir.vc.in.tum.de/faceforensics/'
    elif server == 'CA':
        server_url = 'http://falas.cmpt.sfu.ca:8100/'
    else:
        raise ValueError(f'Wrong server name. Choices: EU, EU2, CA')
    
    tos_url = server_url + 'webpage/FaceForensics_TOS.pdf'
    base_url = server_url + 'v3/'
    deepfakes_model_url = server_url + 'v3/manipulated_sequences/Deepfakes/models/'
    return tos_url, base_url, deepfakes_model_url

def main():
    parser = argparse.ArgumentParser(description="Wrapper for FF++ dataset download using official vendor logic.")
    parser.add_argument('--dataset', type=str, default=config.DEFAULT_DATASET,
                        help="Which dataset partition to download, e.g., Deepfakes, original, etc.")
    parser.add_argument('--compression', type=str, default=config.DEFAULT_COMPRESSION,
                        help="Compression level: raw, c23, c40")
    parser.add_argument('--type', type=str, default=config.DEFAULT_TYPE,
                        help="Data type: videos, masks, models")
    parser.add_argument('--num-videos', type=int, default=config.DEFAULT_NUM_VIDEOS,
                        help="Number of videos to download (optional subset)")
    parser.add_argument('--server', type=str, default=config.DEFAULT_SERVER,
                        help="Mirror server: EU, EU2, CA")
    
    args = parser.parse_args()
    
    out_dir = paths.get_faceforensics_root()
    paths.ensure_directory(out_dir)
    
    logger.info(f"Starting FaceForensics++ download into finalized data directory: {out_dir}")
    logger.info(f"Using arguments: dataset={args.dataset}, compression={args.compression}, "
                f"type={args.type}, server={args.server}, num_videos={args.num_videos}")
    
    tos_url, base_url, deepfakes_model_url = get_urls(args.server)
    
    # 1-to-1 namespace map compatible with the original vendor script parse_args
    vendor_args = argparse.Namespace(
        output_path=str(out_dir),
        dataset=args.dataset,
        compression=args.compression,
        type=args.type,
        num_videos=args.num_videos,
        server=args.server,
        tos_url=tos_url,
        base_url=base_url,
        deepfakes_model_url=deepfakes_model_url
    )
    
    try:
        download_faceforensicspp_raw.main(vendor_args)
        logger.info("Dataset download operation completed successfully.")
    except Exception as e:
        logger.error(f"Vendor script encountered an error during download: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

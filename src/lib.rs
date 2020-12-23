mod models;
mod services;

use crate::models::AppError;
use crate::services::{BingClient, FileManager, NotificationManager, WallpaperManager};
use clap::ArgMatches;
use log::{error, info};
use std::error::Error;

pub async fn run(app_matches: ArgMatches<'_>) -> Result<(), Box<dyn Error>> {
  // Run commands
  match app_matches.subcommand() {
    // Download command
    ("download", Some(sub_m)) => {
      info!("Download image...");

      // First -> Get image info
      let data = BingClient::fetch_bing_data().await?;
      let img = data.images.get(0).expect("No image available");
      let img_url = img.url.clone();
      let img_bytes = BingClient::fetch_bing_photo(&img_url).await?;
      // Save image in fs
      let img_save_path =
        FileManager::save_wallpaper(img_bytes.as_ref(), sub_m.value_of("output-path"))?;

      info!("Image downloaded in folder {}", &img_save_path);

      // Show notification
      if sub_m.is_present("show-notification") {
        info!("Show notification with photo of the day...");
        NotificationManager::show_notification("", &img.copyright, &img_save_path)?;
      }

      // Set as wallpaper
      if sub_m.is_present("set-as-wallpaper") {
        WallpaperManager::set_as_wallpaper(&img_url)?;
        info!("Photo of the day set a desktop wallpaper!");
      }

      Ok(())
    }

    _ => {
      error!("Ohoh... unknown command. Use --help for more information");
      Err(Box::new(AppError::new("Unknown command")))
    }
  }
}

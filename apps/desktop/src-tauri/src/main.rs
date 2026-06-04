// Radio Vaigyaaniq desktop — Tauri (Rust) entrypoint.
// Exposes least-privilege custom commands for bundle metadata, evidence, and storage.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod evidence;
mod storage;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::bundle_metadata,
            commands::write_evidence,
            commands::storage_set,
            commands::storage_get,
            commands::archive_entrypoints
        ])
        .run(tauri::generate_context!())
        .expect("error while running Radio Vaigyaaniq Desktop");
}

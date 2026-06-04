// Tauri command surface (kept intentionally small / least-privilege).
use crate::{evidence, storage};
use serde_json::{json, Value};
use tauri::AppHandle;

/// Bundle metadata. Unknown / unverified fields are explicitly NULL — never fabricated.
#[tauri::command]
pub fn bundle_metadata(app: AppHandle) -> Value {
    let info = app.package_info();
    json!({
        "runtime": "tauri",
        "productName": info.name,
        "version": info.version.to_string(),
        "identifier": app.config().identifier,
        "platform": format!("{}-{}", std::env::consts::OS, std::env::consts::ARCH),
        "build_hash": Value::Null,   // only a verified bundle pipeline may set this
        "installer": Value::Null     // only a verified installer step may set this
    })
}

/// Write a structured evidence report into the app data dir (with provenance + sha256).
#[tauri::command]
pub fn write_evidence(app: AppHandle, kind: String, payload: Value) -> Result<String, String> {
    evidence::write_report(&app, &kind, payload)
}

/// Desktop-safe key/value storage (app data dir).
#[tauri::command]
pub fn storage_set(app: AppHandle, key: String, value: String) -> Result<bool, String> {
    storage::set(&app, &key, &value).map(|_| true)
}

#[tauri::command]
pub fn storage_get(app: AppHandle, key: String) -> Result<Option<String>, String> {
    storage::get(&app, &key)
}

/// Known radio archive entrypoints (served from public/radio-html). Existing URLs preserved.
#[tauri::command]
pub fn archive_entrypoints() -> Vec<String> {
    vec![
        "/radio-html/structure/index.html".into(),
        "/radio-html/Radio_Vaigyaaniq_App_Prototype.html".into(),
        "/radio-html/Radio_Vaigyaaniq_Full_App.html".into(),
        "/radio-html/Radio_Vaigyaaniq_UX_Dashboard.html".into(),
    ]
}

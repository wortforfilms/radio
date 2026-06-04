// Desktop-safe local storage under the OS app-data directory.
use serde_json::{Map, Value};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

fn store_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("storage.json"))
}

fn load(app: &AppHandle) -> Result<Map<String, Value>, String> {
    let p = store_path(app)?;
    if !p.exists() {
        return Ok(Map::new());
    }
    let s = fs::read_to_string(&p).map_err(|e| e.to_string())?;
    let v: Value = serde_json::from_str(&s).unwrap_or(Value::Object(Map::new()));
    Ok(v.as_object().cloned().unwrap_or_default())
}

pub fn set(app: &AppHandle, key: &str, value: &str) -> Result<(), String> {
    let mut m = load(app)?;
    m.insert(key.to_string(), Value::String(value.to_string()));
    let p = store_path(app)?;
    let body = serde_json::to_string_pretty(&Value::Object(m)).map_err(|e| e.to_string())?;
    fs::write(p, body).map_err(|e| e.to_string())
}

pub fn get(app: &AppHandle, key: &str) -> Result<Option<String>, String> {
    let m = load(app)?;
    Ok(m.get(key).and_then(|v| v.as_str()).map(|s| s.to_string()))
}

// Evidence report writer — structured JSON with provenance + sha256 sidecar.
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

fn evidence_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("evidence");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

pub fn write_report(app: &AppHandle, kind: &str, payload: Value) -> Result<String, String> {
    let dir = evidence_dir(app)?;
    let info = app.package_info();
    let wrapped = json!({
        "kind": kind,
        "generated_at": chrono::Utc::now().to_rfc3339(),
        "provenance": {
            "app": info.name,
            "version": info.version.to_string(),
            "platform": format!("{}-{}", std::env::consts::OS, std::env::consts::ARCH)
        },
        "payload": payload
    });
    let safe: String = kind
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();
    let path = dir.join(format!("{safe}.json"));
    let body = serde_json::to_string_pretty(&wrapped).map_err(|e| e.to_string())?;
    fs::write(&path, &body).map_err(|e| e.to_string())?;

    // sha256 sidecar for provenance / tamper-evidence
    let mut h = Sha256::new();
    h.update(body.as_bytes());
    let hash = format!("{:x}", h.finalize());
    fs::write(path.with_extension("sha256"), &hash).map_err(|e| e.to_string())?;

    Ok(path.to_string_lossy().to_string())
}

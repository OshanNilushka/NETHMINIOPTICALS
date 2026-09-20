import blackGlassesModel from '../assets/models/black_glasses.glb';
import cartoonGlassesModel from '../assets/models/cartoon_glasses.glb';
import eyewearSpecsModel from '../assets/models/eyewear_specs.glb';
import glasses1Model from '../assets/models/glasses (1).glb';
import glasses10Model from '../assets/models/glasses (10).glb';
import glasses12Model from '../assets/models/glasses (12).glb';
import glasses13Model from '../assets/models/glasses (13).glb';
import glasses2Model from '../assets/models/glasses (2).glb';
import glasses3Model from '../assets/models/glasses (3).glb';
import glasses4Model from '../assets/models/glasses (4).glb';
import glasses5Model from '../assets/models/glasses (5).glb';
import glasses6Model from '../assets/models/glasses (6).glb';
import glasses7Model from '../assets/models/glasses (7).glb';
import glasses8Model from '../assets/models/glasses (8).glb';
import glasses9Model from '../assets/models/glasses (9).glb';
import glassesModel from '../assets/models/glasses.glb';
import glasses08Model from '../assets/models/glasses_08.glb';
import glasses09Model from '../assets/models/glasses_09.glb';
import glasses2AltModel from '../assets/models/glasses_2.glb';
import metalRoundModel from '../assets/models/metal_round_glasses.glb';
import oakleyModel from '../assets/models/oakley_glasses.glb';
import rayBanModel from '../assets/models/ray_ban_glasses.glb';
import sunGlassesModel from '../assets/models/sun_glasses.glb';
import sunglassesModel from '../assets/models/sunglasses.glb';

export const MODEL_MAP = {
  // Full raw src paths
  "/src/assets/models/cartoon_glasses.glb": cartoonGlassesModel,
  "/src/assets/cartoon_glasses.glb": cartoonGlassesModel,
  "/src/assets/models/oakley_glasses.glb": oakleyModel,
  "/src/assets/oakley_glasses.glb": oakleyModel,
  "/src/assets/models/ray_ban_glasses.glb": rayBanModel,
  "/src/assets/ray_ban_glasses.glb": rayBanModel,
  "/src/assets/models/metal_round_glasses.glb": metalRoundModel,
  "/src/assets/metal_round_glasses.glb": metalRoundModel,
  "/src/assets/models/black_glasses.glb": blackGlassesModel,
  "/src/assets/black_glasses.glb": blackGlassesModel,
  "/src/assets/models/eyewear_specs.glb": eyewearSpecsModel,
  "/src/assets/models/glasses.glb": glassesModel,
  "/src/assets/glasses.glb": glassesModel,

  // Filenames
  "black_glasses.glb": blackGlassesModel,
  "cartoon_glasses.glb": cartoonGlassesModel,
  "eyewear_specs.glb": eyewearSpecsModel,
  "glasses (1).glb": glasses1Model,
  "glasses (10).glb": glasses10Model,
  "glasses (12).glb": glasses12Model,
  "glasses (13).glb": glasses13Model,
  "glasses (2).glb": glasses2Model,
  "glasses (3).glb": glasses3Model,
  "glasses (4).glb": glasses4Model,
  "glasses (5).glb": glasses5Model,
  "glasses (6).glb": glasses6Model,
  "glasses (7).glb": glasses7Model,
  "glasses (8).glb": glasses8Model,
  "glasses (9).glb": glasses9Model,
  "glasses.glb": glassesModel,
  "glasses_08.glb": glasses08Model,
  "glasses_09.glb": glasses09Model,
  "glasses_2.glb": glasses2AltModel,
  "metal_round_glasses.glb": metalRoundModel,
  "oakley_glasses.glb": oakleyModel,
  "ray_ban_glasses.glb": rayBanModel,
  "sun_glasses.glb": sunGlassesModel,
  "sunglasses.glb": sunglassesModel,
};

export const FALLBACK_MODELS = [
  glassesModel,
  rayBanModel,
  oakleyModel,
  metalRoundModel,
  blackGlassesModel,
  sunGlassesModel,
  cartoonGlassesModel,
  glasses2AltModel,
  glasses08Model,
  glasses09Model,
  glasses12Model,
  glasses13Model
];

export function resolveModelUrl(url, item = null) {
  if (!url) return glassesModel;

  // Direct lookup in map
  if (MODEL_MAP[url]) return MODEL_MAP[url];

  // Extract filename
  const filename = url.substring(url.lastIndexOf('/') + 1);
  if (MODEL_MAP[filename]) return MODEL_MAP[filename];

  // If http/https URL (e.g. external CDN)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If /models/ static path
  if (url.startsWith('/models/')) {
    const publicFilename = url.replace('/models/', '');
    if (MODEL_MAP[publicFilename]) return MODEL_MAP[publicFilename];
    return url;
  }

  // If /uploads/ path from server
  if (url.startsWith('/uploads/')) {
    const itemIndex = item && item.id ? (typeof item.id === 'number' ? item.id : String(item.id).charCodeAt(0)) : 0;
    return FALLBACK_MODELS[Math.abs(itemIndex) % FALLBACK_MODELS.length];
  }

  // Clean /src/assets/ to /models/ if not found in map
  if (url.startsWith('/src/assets/')) {
    const cleanFilename = url.substring(url.lastIndexOf('/') + 1);
    if (MODEL_MAP[cleanFilename]) return MODEL_MAP[cleanFilename];
    return `/models/${cleanFilename}`;
  }

  return glassesModel;
}

export default resolveModelUrl;

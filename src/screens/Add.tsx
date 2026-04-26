import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Camera, ScanBarcode } from 'lucide-react';
import { useApp } from '../AppContext';
import { useRecent } from '../hooks/useRecent';
import { todayISO } from '../lib/date';
import { uid } from '../lib/format';
import FoodListItem from '../components/FoodListItem';
import ServingModal from '../components/ServingModal';
import MealServingModal from '../components/MealServingModal';
import CustomFoodForm from '../components/CustomFoodForm';
import PhotoAnalyzeModal from '../components/PhotoAnalyzeModal';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import ProductConfirmModal from '../components/ProductConfirmModal';
import { lookupBarcode, type OffProduct } from '../lib/openFoodFacts';
import type { AnalyzedItem } from '../lib/photoAnalyze';
import type { Food, Meal } from '../types';

type Tab = 'recent' | 'favorites' | 'all' | 'meals' | 'custom';

export default function Add() {
  const navigate = useNavigate();
  const { search, allFoods, favoriteFoods, entries, meals, add, addCustom, toggleFavorite, isFavorite, workerUrl, hasWorker } = useApp();
  const recent = useRecent(entries, allFoods);

  const [tab, setTab] = useState<Tab>('recent');
  const [query, setQuery] = useState('');
  const [pickedFood, setPickedFood] = useState<Food | null>(null);
  const [pickedMeal, setPickedMeal] = useState<Meal | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<OffProduct | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const list = useMemo(() => {
    if (query) return search(query);
    if (tab === 'recent') return recent;
    if (tab === 'favorites') return favoriteFoods;
    if (tab === 'all') return allFoods;
    return [] as Food[];
  }, [query, tab, search, recent, favoriteFoods, allFoods]);

  const submitFood = (food: Food, grams: number, proteinG: number) => {
    add({
      id: uid(),
      dateISO: todayISO(),
      foodId: food.id,
      grams,
      proteinG,
      timestamp: Date.now(),
      source: 'food',
    });
    setPickedFood(null);
    navigate('/');
  };

  const submitMeal = (meal: Meal, servings: number, proteinG: number) => {
    add({
      id: uid(),
      dateISO: todayISO(),
      foodId: meal.id,
      grams: servings,
      proteinG,
      timestamp: Date.now(),
      source: 'meal',
    });
    setPickedMeal(null);
    navigate('/');
  };

  const submitCustom = (food: Food, grams: number, proteinG: number, save: boolean) => {
    if (save) addCustom(food);
    add({
      id: uid(),
      dateISO: todayISO(),
      foodId: save ? food.id : undefined,
      customName: save ? undefined : food.name,
      grams,
      proteinG,
      timestamp: Date.now(),
      source: 'custom',
    });
    navigate('/');
  };

  const submitPhotoItems = (items: AnalyzedItem[]) => {
    const now = Date.now();
    items.forEach((it, idx) => {
      add({
        id: uid(),
        dateISO: todayISO(),
        customName: it.name,
        grams: it.estimatedGrams,
        proteinG: it.proteinG,
        timestamp: now + idx,
        source: 'photo',
      });
    });
    setPhotoFile(null);
    navigate('/');
  };

  const submitProduct = (grams: number, proteinG: number) => {
    if (!scannedProduct) return;
    add({
      id: uid(),
      dateISO: todayISO(),
      customName: scannedProduct.name,
      grams,
      proteinG,
      timestamp: Date.now(),
      source: 'barcode',
    });
    setScannedProduct(null);
    navigate('/');
  };

  const onBarcode = async (code: string) => {
    setScanning(false);
    setScanError(null);
    try {
      const product = await lookupBarcode(code);
      if (!product) {
        setScanError(`No data for barcode ${code}. Add it manually under "Custom".`);
        return;
      }
      setScannedProduct(product);
    } catch (e) {
      setScanError((e as Error).message || 'Lookup failed');
    }
  };

  const onPhotoButton = () => {
    if (!hasWorker) {
      navigate('/profile');
      return;
    }
    photoInputRef.current?.click();
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add food</h1>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={onPhotoButton}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 active:scale-[0.99] transition"
        >
          <Camera size={18} />
          <span className="font-semibold text-sm">Photo</span>
          {!hasWorker && <span className="text-[10px] text-slate-400">setup</span>}
        </button>
        <button
          onClick={() => {
            setScanError(null);
            setScanning(true);
          }}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 active:scale-[0.99] transition"
        >
          <ScanBarcode size={18} />
          <span className="font-semibold text-sm">Barcode</span>
        </button>
      </div>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setPhotoFile(f);
          e.target.value = '';
        }}
      />
      {scanError && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-300">
          {scanError}
        </div>
      )}

      <div className="relative mb-3">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods…"
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto bg-slate-200 dark:bg-slate-800 rounded-xl p-1 mb-4 text-sm">
        {(['recent', 'favorites', 'all', 'meals', 'custom'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold capitalize whitespace-nowrap ${
              tab === t ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-500'
            }`}
          >
            {t === 'meals' ? 'My meals' : t}
          </button>
        ))}
      </div>

      {tab === 'custom' && !query ? (
        <CustomFoodForm onSubmit={submitCustom} />
      ) : tab === 'meals' && !query ? (
        meals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 mb-3">No meals yet.</p>
            <button
              onClick={() => navigate('/meals')}
              className="px-5 py-3 bg-brand-600 text-white rounded-xl font-semibold"
            >
              Build your first meal
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {meals.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => setPickedMeal(m)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium truncate">{m.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {Math.round(m.totalProteinG / Math.max(m.servings, 1))} g / serving · {m.servings} servings
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )
      ) : list.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
          {tab === 'recent' ? 'No recent items yet.' : tab === 'favorites' ? 'No favorites yet.' : 'No matches.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((f) => (
            <li key={f.id}>
              <FoodListItem food={f} onTap={() => setPickedFood(f)} />
            </li>
          ))}
        </ul>
      )}

      {pickedFood && (
        <ServingModal
          food={pickedFood}
          isFavorite={isFavorite(pickedFood.id)}
          onClose={() => setPickedFood(null)}
          onToggleFavorite={() => toggleFavorite(pickedFood.id)}
          onSave={(g, p) => submitFood(pickedFood, g, p)}
        />
      )}
      {pickedMeal && (
        <MealServingModal
          meal={pickedMeal}
          onClose={() => setPickedMeal(null)}
          onSave={(s, p) => submitMeal(pickedMeal, s, p)}
        />
      )}
      {photoFile && hasWorker && (
        <PhotoAnalyzeModal
          workerUrl={workerUrl}
          file={photoFile}
          onClose={() => setPhotoFile(null)}
          onConfirm={submitPhotoItems}
        />
      )}
      {scanning && (
        <BarcodeScannerModal onClose={() => setScanning(false)} onCode={onBarcode} />
      )}
      {scannedProduct && (
        <ProductConfirmModal
          product={scannedProduct}
          onClose={() => setScannedProduct(null)}
          onConfirm={submitProduct}
        />
      )}
    </div>
  );
}

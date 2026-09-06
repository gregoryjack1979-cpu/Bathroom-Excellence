"use client";

/**
 * Bathroom Design Builder — central state.
 *
 * A reducer behind React context. Every SET runs the configuration through
 * `normalizeConfiguration`, so compatibility rules are enforced once, here.
 * The provider also autosaves a draft and offers it back after a reload.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { steps } from "./configuratorData";
import {
  DEFAULT_CONFIGURATION,
  applicableStepCount,
  getStepStatus,
  isDefaultConfiguration,
  isStepApplicable,
  normalizeConfiguration,
  reviewedStepCount,
} from "./rules";
import { clearDraft, loadDraft, saveDraft } from "./storage";
import type {
  BathroomTypeId,
  Configuration,
  ConfigurationField,
  DoorTypeId,
  GroutColorId,
  RoomThemeId,
  SafetyOptionId,
  SavedDesign,
  StepDefinition,
  StepId,
  StepStatus,
  StorageOptionId,
  TrimColorId,
  WallStyleId,
  WallTypeId,
  WindowOptionId,
} from "./types";

interface State {
  configuration: Configuration;
  stepIndex: number;
  /** Steps the user has opened — progress is "reviewed", since every step starts with a value */
  visited: StepId[];
}

type Action =
  | { type: "SET_FIELD"; field: ConfigurationField; value: Configuration[ConfigurationField] }
  | { type: "RESET" }
  | { type: "LOAD"; configuration: Configuration }
  | { type: "GO_TO"; index: number }
  | { type: "NEXT" }
  | { type: "PREV" };

const clamp = (i: number) => Math.max(0, Math.min(steps.length - 1, i));

const INITIAL: State = { configuration: DEFAULT_CONFIGURATION, stepIndex: 0, visited: [steps[0].id] };

/** Next/Back skip steps that don't apply to the current design. */
function stepFrom(config: Configuration, from: number, dir: 1 | -1): number {
  let i = from + dir;
  while (i >= 0 && i < steps.length) {
    if (isStepApplicable(config, steps[i].id)) return i;
    i += dir;
  }
  return from;
}

function moveTo(state: State, index: number): State {
  const id = steps[index].id;
  return { ...state, stepIndex: index, visited: state.visited.includes(id) ? state.visited : [...state.visited, id] };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        configuration: normalizeConfiguration({ ...state.configuration, [action.field]: action.value }),
      };
    case "RESET":
      return INITIAL;
    case "LOAD":
      // a loaded design is a finished one — count every step as reviewed
      return { configuration: normalizeConfiguration(action.configuration), stepIndex: 0, visited: steps.map((s) => s.id) };
    case "GO_TO":
      return moveTo(state, clamp(action.index));
    case "NEXT":
      return moveTo(state, stepFrom(state.configuration, state.stepIndex, 1));
    case "PREV":
      return moveTo(state, stepFrom(state.configuration, state.stepIndex, -1));
  }
}

export interface ConfiguratorContextValue {
  configuration: Configuration;
  steps: StepDefinition[];
  stepIndex: number;
  currentStep: StepDefinition;
  stepStatus: (step: StepDefinition) => StepStatus;
  reviewedCount: number;
  applicableCount: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  /** Nothing changed from the starting design */
  isDefault: boolean;

  setField: <F extends ConfigurationField>(field: F, value: Configuration[F]) => void;
  setBathroomType: (v: BathroomTypeId) => void;
  setRoomTheme: (v: RoomThemeId) => void;
  setWallType: (v: WallTypeId) => void;
  setWallStyle: (v: WallStyleId) => void;
  setGroutColor: (v: GroutColorId) => void;
  setDoorType: (v: DoorTypeId) => void;
  setTrimColor: (v: TrimColorId) => void;
  setStorageOption: (v: StorageOptionId) => void;
  setDecorativeAccent: (v: boolean) => void;
  setWindowOption: (v: WindowOptionId) => void;
  setSafetyOption: (v: SafetyOptionId) => void;
  resetConfiguration: () => void;
  loadConfiguration: (configuration: Configuration) => void;

  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  /** A draft from a previous visit, waiting for the user to accept or discard it */
  pendingRestore: SavedDesign | null;
  restoreDraft: () => void;
  discardDraft: () => void;
}

const ConfiguratorContext = createContext<ConfiguratorContextValue | null>(null);

export function ConfiguratorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [pendingRestore, setPendingRestore] = useState<SavedDesign | null>(null);
  // autosave stays off until we've decided what to do with any previous draft,
  // otherwise the initial state would overwrite it before the prompt shows
  const [restoreSettled, setRestoreSettled] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    if (draft && !isDefaultConfiguration(draft.configuration)) setPendingRestore(draft);
    else setRestoreSettled(true);
  }, []);

  useEffect(() => {
    if (!restoreSettled) return;
    if (isDefaultConfiguration(state.configuration)) clearDraft();
    else saveDraft(state.configuration);
  }, [state.configuration, restoreSettled]);

  const setField = useCallback(
    <F extends ConfigurationField>(field: F, value: Configuration[F]) => dispatch({ type: "SET_FIELD", field, value }),
    [],
  );

  const value = useMemo<ConfiguratorContextValue>(() => {
    const { configuration, stepIndex } = state;
    const visited = new Set(state.visited);
    return {
      configuration,
      steps,
      stepIndex,
      currentStep: steps[stepIndex],
      stepStatus: (step) => getStepStatus(configuration, step, visited),
      reviewedCount: reviewedStepCount(configuration, visited),
      applicableCount: applicableStepCount(configuration),
      isFirstStep: stepFrom(configuration, stepIndex, -1) === stepIndex,
      isLastStep: stepFrom(configuration, stepIndex, 1) === stepIndex,
      isDefault: isDefaultConfiguration(configuration),

      setField,
      setBathroomType: (v) => setField("bathroomType", v),
      setRoomTheme: (v) => setField("roomTheme", v),
      setWallType: (v) => setField("wallType", v),
      setWallStyle: (v) => setField("wallStyle", v),
      setGroutColor: (v) => setField("groutColor", v),
      setDoorType: (v) => setField("doorType", v),
      setTrimColor: (v) => setField("trimColor", v),
      setStorageOption: (v) => setField("storageOption", v),
      setDecorativeAccent: (v) => setField("decorativeAccent", v),
      setWindowOption: (v) => setField("windowOption", v),
      setSafetyOption: (v) => setField("safetyOption", v),
      resetConfiguration: () => dispatch({ type: "RESET" }),
      loadConfiguration: (c) => dispatch({ type: "LOAD", configuration: c }),

      goToStep: (index) => dispatch({ type: "GO_TO", index }),
      nextStep: () => dispatch({ type: "NEXT" }),
      prevStep: () => dispatch({ type: "PREV" }),

      pendingRestore,
      restoreDraft: () => {
        if (pendingRestore) dispatch({ type: "LOAD", configuration: pendingRestore.configuration });
        setPendingRestore(null);
        setRestoreSettled(true);
      },
      discardDraft: () => {
        clearDraft();
        setPendingRestore(null);
        setRestoreSettled(true);
      },
    };
  }, [state, setField, pendingRestore]);

  return <ConfiguratorContext.Provider value={value}>{children}</ConfiguratorContext.Provider>;
}

export function useConfigurator(): ConfiguratorContextValue {
  const ctx = useContext(ConfiguratorContext);
  if (!ctx) throw new Error("useConfigurator must be used inside <ConfiguratorProvider>");
  return ctx;
}

import { create } from "zustand";
interface PremiumModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const usePremiumModal = create<PremiumModalProps>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}));

export default usePremiumModal;

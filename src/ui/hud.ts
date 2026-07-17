export class Hud {
  private stress = 100;
  private fill = document.getElementById("stress-fill")!;
  private comboEl = document.getElementById("combo")!;
  private hint = document.getElementById("hint")!;
  private victoryEl = document.getElementById("victory")!;
  private comboTimer = 0;

  constructor(onAgain: () => void) {
    document.getElementById("btn-again")!.addEventListener("click", () => {
      this.victoryEl.classList.remove("show");
      onAgain();
    });
  }

  /** Returns true when stress reaches zero (victory). */
  drain(amount: number): boolean {
    if (this.stress <= 0) return false;
    this.stress = Math.max(0, this.stress - amount * 0.9);
    this.fill.style.width = `${this.stress}%`;
    this.hint.style.display = "none";
    return this.stress <= 0;
  }

  showCombo(n: number): void {
    this.comboEl.textContent = `COMBO ×${n}`;
    this.comboEl.style.opacity = "1";
    clearTimeout(this.comboTimer);
    this.comboTimer = window.setTimeout(() => {
      this.comboEl.style.opacity = "0";
    }, 900);
  }

  victory(hits: number, bestCombo: number): void {
    document.getElementById("stat-hits")!.textContent = `${hits} hits of pure relief`;
    document.getElementById("stat-combo")!.textContent = `best combo: ×${bestCombo}`;
    this.victoryEl.classList.add("show");
  }

  reset(): void {
    this.stress = 100;
    this.fill.style.width = "100%";
  }
}

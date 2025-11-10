import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function EducationalContent() {
  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-6 pr-4">
        {/* Introduction */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">About This Application</h2>
          <p className="text-muted-foreground leading-relaxed">
            This Composite Laminate Structural Analysis Tool is designed to analyze and predict the mechanical behavior 
            of composite laminate structures. It implements Classical Lamination Theory (CLT) and advanced failure analysis 
            methods to provide comprehensive structural insights for engineering applications.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            The tool enables engineers and researchers to design, analyze, and optimize composite structures for various 
            applications including aerospace, automotive, marine, and civil engineering.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Created by <span className="font-semibold text-foreground">PhD candidate Ursache Stefan</span> and 
            co-authored by <span className="font-semibold text-foreground">Vlad Nitoiu</span>.
          </p>
        </Card>

        {/* Mathematical Foundation */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Mathematical Foundation</h2>
          
          <h3 className="text-xl font-semibold text-foreground mb-3">Classical Lamination Theory (CLT)</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Classical Lamination Theory is the fundamental framework used to analyze laminated composite materials. 
            It relates the applied forces and moments to the resulting strains and curvatures through the ABD stiffness matrix.
          </p>

          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <p className="text-sm font-mono text-foreground">
              [N, M]ᵀ = [A, B; B, D] × [ε⁰, κ]ᵀ
            </p>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Where:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>N</strong> = In-plane force resultants (Nx, Ny, Nxy)</li>
              <li><strong>M</strong> = Moment resultants (Mx, My, Mxy)</li>
              <li><strong>ε⁰</strong> = Mid-plane strains</li>
              <li><strong>κ</strong> = Plate curvatures</li>
              <li><strong>A</strong> = Extensional stiffness matrix (3×3)</li>
              <li><strong>B</strong> = Coupling stiffness matrix (3×3)</li>
              <li><strong>D</strong> = Bending stiffness matrix (3×3)</li>
            </ul>
          </div>

          <Separator className="my-4" />

          <h3 className="text-xl font-semibold text-foreground mb-3">ABD Matrix Components</h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            The ABD matrix relates forces and moments to mid-plane strains and curvatures:
          </p>
          
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <p className="text-sm font-mono text-foreground mb-2">
              [Nₓ, Nᵧ, Nₓᵧ]ᵀ = [A][ε⁰] + [B][κ]
            </p>
            <p className="text-sm font-mono text-foreground">
              [Mₓ, Mᵧ, Mₓᵧ]ᵀ = [B][ε⁰] + [D][κ]
            </p>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground mb-4">
            <p><strong className="text-foreground">Where:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Nₓ, Nᵧ, Nₓᵧ</strong> = Resultant in-plane forces (normal and shear)</li>
              <li><strong>Mₓ, Mᵧ, Mₓᵧ</strong> = Resultant bending and twisting moments</li>
              <li><strong>ε⁰</strong> = Mid-plane strains [ε⁰ₓ, ε⁰ᵧ, γ⁰ₓᵧ]</li>
              <li><strong>κ</strong> = Curvatures [κₓ, κᵧ, κₓᵧ]</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">A Matrix (Extensional Stiffness):</h4>
              <div className="bg-muted/50 p-3 rounded-lg mb-2">
                <p className="text-sm font-mono text-foreground">
                  Aᵢⱼ = Σₖ₌₁ⁿ (Q̄ᵢⱼ)ₖ × (hₖ - hₖ₋₁)
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Represents the in-plane (extensional) stiffness of the laminate. Terms A₁₆ and A₂₆ introduce coupling 
                behavior by relating shear strains to normal stresses. If these terms are non-zero, the laminate is unbalanced.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">B Matrix (Coupling Stiffness):</h4>
              <div className="bg-muted/50 p-3 rounded-lg mb-2">
                <p className="text-sm font-mono text-foreground">
                  Bᵢⱼ = (1/2) × Σₖ₌₁ⁿ (Q̄ᵢⱼ)ₖ × (hₖ² - hₖ₋₁²)
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Coupling between bending and extension. Zero for symmetric laminates. These terms generally connect 
                bending strains with normal stress resultants, apart from B₁₆ and B₂₆, which relate twisting curvature 
                to normal stress resultants.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">D Matrix (Bending Stiffness):</h4>
              <div className="bg-muted/50 p-3 rounded-lg mb-2">
                <p className="text-sm font-mono text-foreground">
                  Dᵢⱼ = (1/3) × Σₖ₌₁ⁿ (Q̄ᵢⱼ)ₖ × (hₖ³ - hₖ₋₁³)
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Represents the bending stiffness of the laminate and connects plate curvatures to bending moments. 
                D₁₆ and D₂₆ couple torsion to bending.
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <h3 className="text-xl font-semibold text-foreground mb-3">Transformation Matrix [T]</h3>
          <p className="text-sm text-muted-foreground mb-4">
            The transformation matrix [T] is used to transform material properties from the principal material 
            coordinate system (1-2 axes aligned with fibers) to the global laminate coordinate system (x-y axes). 
            This matrix accounts for the fiber orientation angle θ.
          </p>
          
          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            <p><strong className="text-foreground">Transformation Matrix [T]:</strong></p>
            <div className="bg-muted/50 p-3 rounded-lg space-y-1">
              <p className="font-mono">
                [T] = [m²    n²    2mn  ]
              </p>
              <p className="font-mono">
                      [n²    m²   -2mn  ]
              </p>
              <p className="font-mono">
                      [-mn   mn   m²-n² ]
              </p>
              <p className="font-mono mt-3">where:</p>
              <p className="font-mono ml-4">m = cos(θ)</p>
              <p className="font-mono ml-4">n = sin(θ)</p>
              <p className="text-xs mt-2">
                <strong>θ</strong> is the angle between the x-axis (laminate reference) and the 1-axis (fiber direction)
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <h3 className="text-xl font-semibold text-foreground mb-3">Transformed Stiffness Matrix [Q̄]</h3>
          <p className="text-sm text-muted-foreground mb-4">
            To express the stress-strain relationship in the global x-y axes, the transformed stiffness matrix [Q̄] is used. 
            This represents the stiffness of the lamina with respect to the x-y axes and is obtained by transforming 
            the principal stiffness matrix [Q] using the transformation matrix [T]:
          </p>
          
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <p className="text-sm font-mono text-foreground mb-3">
              [Q̄] = [T]⁻¹ × [Q] × [T]
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              The stress-strain relation in the x-y coordinate system is then:
            </p>
            <p className="text-sm font-mono text-foreground">
              [σₓ, σᵧ, τₓᵧ]ᵀ = [Q̄₁₁ Q̄₁₂ Q̄₁₆; Q̄₁₂ Q̄₂₂ Q̄₂₆; Q̄₁₆ Q̄₂₆ Q̄₆₆] × [εₓ, εᵧ, γₓᵧ]ᵀ
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Reduced Stiffness Matrix [Q] Components (in material axes):</strong></p>
            <div className="bg-muted/50 p-3 rounded-lg space-y-1">
              <p className="font-mono">Q₁₁ = E₁ / (1 - ν₁₂ν₂₁)</p>
              <p className="font-mono">Q₂₂ = E₂ / (1 - ν₁₂ν₂₁)</p>
              <p className="font-mono">Q₁₂ = ν₁₂E₂ / (1 - ν₁₂ν₂₁)</p>
              <p className="font-mono">Q₆₆ = G₁₂</p>
              <p className="text-xs mt-2">where: ν₂₁ = ν₁₂ × E₂ / E₁ (reciprocal Poisson's ratio)</p>
            </div>
          </div>
        </Card>

        {/* Formula Correlations */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Formula Correlations & Analysis Flow</h2>
          
          <p className="text-muted-foreground leading-relaxed mb-4">
            The formulas used in this application are interconnected and follow a systematic workflow. 
            Understanding these correlations is essential for proper composite laminate analysis.
          </p>

          <div className="space-y-6">
            {/* Step 1 */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Step 1: Material Properties → Reduced Stiffness Matrix (Q)
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                The analysis begins with individual ply material properties (E₁, E₂, G₁₂, ν₁₂) which are 
                used to calculate the <strong>reduced stiffness matrix Q</strong> in the material coordinate system:
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono space-y-1">
                <p className="text-foreground">Q₁₁ = E₁ / (1 - ν₁₂ν₂₁)</p>
                <p className="text-foreground">Q₂₂ = E₂ / (1 - ν₁₂ν₂₁)</p>
                <p className="text-foreground">Q₁₂ = ν₁₂E₂ / (1 - ν₁₂ν₂₁)</p>
                <p className="text-foreground">Q₆₆ = G₁₂</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                → This Q matrix characterizes the stiffness of a single ply in its own coordinate system (1-2 axes).
              </p>
            </div>

            <Separator />

            {/* Step 2 */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Step 2: Q Matrix + Ply Angle → Transformed Stiffness Matrix (Q̄)
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Each ply is oriented at an angle θ. The Q matrix is transformed to the laminate coordinate system 
                (x-y) using the transformation matrix T:
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                <p className="text-foreground">Q̄ᵢⱼ = T × Qᵢⱼ × Tᵀ</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                → This Q̄ matrix accounts for fiber orientation and allows all plies to be analyzed in a common 
                coordinate system.
              </p>
            </div>

            <Separator />

            {/* Step 3 */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Step 3: Q̄ Matrices + Ply Positions → ABD Matrix
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                The transformed stiffness matrices Q̄ for all plies are integrated through the thickness 
                using ply positions (zₖ) to obtain the <strong>ABD stiffness matrix</strong>:
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono space-y-1">
                <p className="text-foreground">Aᵢⱼ = Σₖ (Q̄ᵢⱼ)ₖ × (zₖ - zₖ₋₁)  [Extensional stiffness]</p>
                <p className="text-foreground">Bᵢⱼ = (1/2) × Σₖ (Q̄ᵢⱼ)ₖ × (zₖ² - zₖ₋₁²)  [Coupling stiffness]</p>
                <p className="text-foreground">Dᵢⱼ = (1/3) × Σₖ (Q̄ᵢⱼ)ₖ × (zₖ³ - zₖ₋₁³)  [Bending stiffness]</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                → The ABD matrix characterizes the entire laminate's response to forces (N) and moments (M). 
                The A matrix relates to in-plane loads, D to bending, and B to extension-bending coupling.
              </p>
            </div>

            <Separator />

            {/* Step 4 */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Step 4: ABD Matrix + Applied Loads → Mid-plane Strains & Curvatures
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Using Classical Lamination Theory (CLT), applied forces (N) and moments (M) are related 
                to mid-plane strains (ε⁰) and curvatures (κ):
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                <p className="text-foreground">[N, M]ᵀ = [A, B; B, D] × [ε⁰, κ]ᵀ</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Inverting this relationship:
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                <p className="text-foreground">[ε⁰, κ]ᵀ = [A, B; B, D]⁻¹ × [N, M]ᵀ</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                → This gives us the global deformation response of the laminate to the applied loads.
              </p>
            </div>

            <Separator />

            {/* Step 5 */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Step 5: ε⁰ & κ + Position → Strain Distribution Through Thickness
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Strains vary linearly through the thickness. At any position z from the mid-plane:
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono space-y-1">
                <p className="text-foreground">εₓ(z) = ε⁰ₓ + z × κₓ</p>
                <p className="text-foreground">εᵧ(z) = ε⁰ᵧ + z × κᵧ</p>
                <p className="text-foreground">γₓᵧ(z) = γ⁰ₓᵧ + z × κₓᵧ</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                → This allows calculation of strains at any specific ply location through the laminate thickness.
              </p>
            </div>

            <Separator />

            {/* Step 6 */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Step 6: Strains + Q̄ → Global Stresses in Each Ply
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Using the transformed stiffness matrix Q̄ and the strains at each ply location, 
                we calculate global stresses (x-y coordinate system):
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                <p className="text-foreground">[σₓ, σᵧ, τₓᵧ]ᵀ = [Q̄] × [εₓ, εᵧ, γₓᵧ]ᵀ</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                → These are the stresses in the laminate coordinate system for each ply.
              </p>
            </div>

            <Separator />

            {/* Step 7 */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Step 7: Global Stresses → Material Axis Stresses
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                For failure analysis, global stresses must be transformed back to the material principal 
                axes (1-2) for each ply using its fiber angle θ:
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono space-y-1">
                <p className="text-foreground">σ₁ = σₓcos²θ + σᵧsin²θ + 2τₓᵧsinθcosθ</p>
                <p className="text-foreground">σ₂ = σₓsin²θ + σᵧcos²θ - 2τₓᵧsinθcosθ</p>
                <p className="text-foreground">τ₁₂ = -σₓsinθcosθ + σᵧsinθcosθ + τₓᵧ(cos²θ - sin²θ)</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                → Material axis stresses (σ₁, σ₂, τ₁₂) are needed because material strengths are defined 
                in the fiber direction.
              </p>
            </div>

            <Separator />

            {/* Step 8 */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Step 8: Material Stresses + Strengths → Failure Analysis
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                The material axis stresses are compared against material strengths using failure criteria:
              </p>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-foreground">Maximum Stress Theory:</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Non-interactive criterion where failure occurs if any stress on the principal axes exceeds the strength:
                  </p>
                  <div className="bg-muted/50 p-2 rounded font-mono text-xs space-y-1">
                    <p>σ₁/F₁ₜ ≥ 1 (when σ₁ &gt; 0, tension)</p>
                    <p>|σ₁|/F₁c ≥ 1 (when σ₁ &lt; 0, compression)</p>
                    <p>σ₂/F₂ₜ ≥ 1 (when σ₂ &gt; 0, tension)</p>
                    <p>|σ₂|/F₂c ≥ 1 (when σ₂ &lt; 0, compression)</p>
                    <p>|τ₁₂|/F₆ ≥ 1 (shear)</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Tsai-Wu Criterion:</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Interactive polynomial failure criterion:
                  </p>
                  <div className="bg-muted/50 p-2 rounded font-mono text-xs space-y-1">
                    <p>F₁σ₁ + F₂σ₂ + F₁₁σ₁² + F₂₂σ₂² + F₆₆τ₁₂² + 2F₁₂σ₁σ₂ = 1</p>
                    <p className="text-xs mt-2">Strength coefficients:</p>
                    <p>F₁ = (1/F₁ₜ) - (1/F₁c)</p>
                    <p>F₂ = (1/F₂ₜ) - (1/F₂c)</p>
                    <p>F₁₁ = 1/(F₁ₜ × F₁c)</p>
                    <p>F₂₂ = 1/(F₂ₜ × F₂c)</p>
                    <p>F₆₆ = 1/F₆²</p>
                    <p>-1/(2√(F₁₁F₂₂)) ≤ F₁₂ ≤ 0</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    For safety factor R: R²a + Rb - 1 = 0, where R = (-b + √(b² + 4a))/(2a)
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Tsai-Hill Criterion:</p>
                  <div className="bg-muted/50 p-2 rounded font-mono text-xs">
                    (σ₁/X)² - (σ₁σ₂/X²) + (σ₂/Y)² + (τ₁₂/S)² ≤ 1
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    where X, Y, S are the appropriate strengths (tension/compression)
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                → Failure indices &gt; 1 indicate ply failure. Different criteria provide different predictions 
                based on their assumptions about failure mechanisms.
              </p>
            </div>

            <Separator />

            {/* Thermal Extension */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Thermal Analysis Extension
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                When temperature changes (ΔT) are present, thermal effects are superimposed on mechanical loads:
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-semibold text-foreground">1. Thermal strains in material axes:</p>
                  <div className="bg-muted/50 p-2 rounded font-mono text-xs">
                    ε₁ᵀ = α₁ × ΔT
                  </div>
                  <div className="bg-muted/50 p-2 rounded font-mono text-xs mt-1">
                    ε₂ᵀ = α₂ × ΔT
                  </div>
                  <div className="bg-muted/50 p-2 rounded font-mono text-xs mt-1">
                    γ₁₂ᵀ = 0
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">2. Thermal forces and moments:</p>
                  <div className="bg-muted/50 p-2 rounded font-mono text-xs">
                    [Nₓᵀ, Nᵧᵀ, Nₓᵧᵀ]ᵀ = Σₖ₌₁ⁿ [Q̄₁₁ Q̄₁₂ Q̄₁₆; Q̄₁₂ Q̄₂₂ Q̄₂₆; Q̄₁₆ Q̄₂₆ Q̄₆₆]ₖ × [εₓᵀ, εᵧᵀ, γₓᵧᵀ]ᵀₖ
                  </div>
                  <div className="bg-muted/50 p-2 rounded font-mono text-xs mt-1">
                    [Mₓᵀ, Mᵧᵀ, Mₓᵧᵀ]ᵀ = Σₖ₌₁ⁿ [Q̄₁₁ Q̄₁₂ Q̄₁₆; Q̄₁₂ Q̄₂₂ Q̄₂₆; Q̄₁₆ Q̄₂₆ Q̄₆₆]ₖ × [εₓᵀ, εᵧᵀ, γₓᵧᵀ]ᵀₖ × zₖ
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">3. Total loading (superposition):</p>
                  <div className="bg-muted/50 p-2 rounded font-mono text-xs">
                    [Nₓ_total, Nᵧ_total, Nₓᵧ_total]ᵀ = [Nₓ, Nᵧ, Nₓᵧ]ᵀ + [Nₓᵀ, Nᵧᵀ, Nₓᵧᵀ]ᵀ
                  </div>
                  <div className="bg-muted/50 p-2 rounded font-mono text-xs mt-1">
                    [Mₓ_total, Mᵧ_total, Mₓᵧ_total]ᵀ = [Mₓ, Mᵧ, Mₓᵧ]ᵀ + [Mₓᵀ, Mᵧᵀ, Mₓᵧᵀ]ᵀ
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                → Thermal loads are added to mechanical loads before solving the CLT equations (Step 4).
              </p>
            </div>

            <Separator />

            {/* Progressive Failure */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Progressive Failure Analysis Loop
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                For progressive failure, the analysis cycles through Steps 1-8 iteratively:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-2">
                <li>Perform complete analysis (Steps 1-8) with current material properties</li>
                <li>Identify first ply failure (highest failure index)</li>
                <li>If failure detected, degrade that ply's material properties:
                  <div className="bg-muted/50 p-2 rounded font-mono text-xs mt-1 ml-4">
                    E₁ᵈᵉᵍ = 0.1 × E₁,  E₂ᵈᵉᵍ = 0.1 × E₂,  G₁₂ᵈᵉᵍ = 0.1 × G₁₂
                  </div>
                </li>
                <li>Return to Step 1 with updated material properties</li>
                <li>Continue until ultimate failure (multiple plies failed) or loads are safe</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2 italic">
                → This simulates load redistribution as plies fail progressively, providing more realistic 
                failure predictions than first-ply failure alone.
              </p>
            </div>

            <Separator />

            {/* Additional Analyses */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Additional Analysis Correlations
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-foreground">Equivalent Properties (from ABD):</p>
                  <div className="bg-muted/50 p-2 rounded font-mono text-xs space-y-1">
                    <p>Eₓ = (A₁₁A₂₂ - A₁₂²) / (h × A₂₂)</p>
                    <p>Gₓᵧ = A₆₆ / h</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    → The ABD matrix (Step 3) is used to calculate equivalent homogeneous properties for simplified design.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">Buckling (from D matrix):</p>
                  <div className="bg-muted/50 p-2 rounded font-mono text-xs">
                    Nₓᶜʳ = k × π² × Dₑff / b²
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    → The bending stiffness D from the ABD matrix determines buckling resistance.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">Interlaminar Stresses (from in-plane stresses):</p>
                  <div className="bg-muted/50 p-2 rounded font-mono text-xs">
                    ∂τₓz/∂z = -∂σₓ/∂x - ∂τₓᵧ/∂y
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    → In-plane stress gradients (Step 6) are used with equilibrium equations to estimate 
                    out-of-plane shear stresses that can cause delamination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Failure Criteria */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Failure Analysis Methods</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Maximum Stress Criterion</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Failure occurs when any stress component exceeds the corresponding strength:
              </p>
              <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm font-mono">
                <p className="text-foreground">|σ₁| ≤ Xᵗ (tension) or Xᶜ (compression)</p>
                <p className="text-foreground">|σ₂| ≤ Yᵗ (tension) or Yᶜ (compression)</p>
                <p className="text-foreground">|τ₁₂| ≤ S</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Failure Index = max(|σ₁|/X, |σ₂|/Y, |τ₁₂|/S)
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Tsai-Wu Criterion</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Interactive polynomial failure criterion that accounts for stress interactions:
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                <p className="text-foreground">
                  F₁σ₁ + F₂σ₂ + F₁₁σ₁² + F₂₂σ₂² + F₆₆τ₁₂² + 2F₁₂σ₁σ₂ ≤ 1
                </p>
              </div>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p><strong className="text-foreground">Coefficients:</strong></p>
                <p className="font-mono">F₁ = 1/Xᵗ - 1/Xᶜ</p>
                <p className="font-mono">F₂ = 1/Yᵗ - 1/Yᶜ</p>
                <p className="font-mono">F₁₁ = 1/(Xᵗ × Xᶜ)</p>
                <p className="font-mono">F₂₂ = 1/(Yᵗ × Yᶜ)</p>
                <p className="font-mono">F₆₆ = 1/S²</p>
                <p className="font-mono">F₁₂ = -0.5 × √(F₁₁ × F₂₂)</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Tsai-Hill Criterion</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Quadratic failure criterion derived from Von Mises yield criterion:
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                <p className="text-foreground">
                  (σ₁/X)² - (σ₁σ₂/X²) + (σ₂/Y)² + (τ₁₂/S)² ≤ 1
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Where X, Y, S are the appropriate strengths based on stress signs
              </p>
            </div>
          </div>
        </Card>

        {/* Stress-Strain Relationships */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Stress-Strain Relationships</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Global Strain Field</h3>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono space-y-1">
                <p className="text-foreground">εₓ(z) = ε⁰ₓ + z × κₓ</p>
                <p className="text-foreground">εᵧ(z) = ε⁰ᵧ + z × κᵧ</p>
                <p className="text-foreground">γₓᵧ(z) = γ⁰ₓᵧ + z × κₓᵧ</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Where z is the distance from the mid-plane, ε⁰ are mid-plane strains, and κ are curvatures.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Ply Stress Calculation</h3>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                <p className="text-foreground">[σ] = [Q̄] × [ε]</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Global stresses in each ply are computed using the transformed stiffness matrix.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Material Axis Transformation</h3>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono space-y-1">
                <p className="text-foreground">σ₁ = σₓcos²θ + σᵧsin²θ + 2τₓᵧsinθcosθ</p>
                <p className="text-foreground">σ₂ = σₓsin²θ + σᵧcos²θ - 2τₓᵧsinθcosθ</p>
                <p className="text-foreground">τ₁₂ = -σₓsinθcosθ + σᵧsinθcosθ + τₓᵧ(cos²θ - sin²θ)</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Transforms global stresses to material principal axes for failure analysis.
              </p>
            </div>
          </div>
        </Card>

        {/* Engineering Properties */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Equivalent Engineering Properties</h2>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-3">
              The laminate can be treated as an equivalent homogeneous orthotropic material with:
            </p>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm font-mono">
              <p className="text-foreground">Eₓ = (A₁₁A₂₂ - A₁₂²) / (h × A₂₂)</p>
              <p className="text-foreground">Eᵧ = (A₁₁A₂₂ - A₁₂²) / (h × A₁₁)</p>
              <p className="text-foreground">Gₓᵧ = A₆₆ / h</p>
              <p className="text-foreground">νₓᵧ = A₁₂ / A₂₂</p>
              <p className="text-foreground">νᵧₓ = A₁₂ / A₁₁</p>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Where h is the total laminate thickness.
            </p>
          </div>
        </Card>

        {/* Thermal Analysis */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Thermal Stress Analysis</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Thermal Forces and Moments</h3>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono space-y-1">
                <p className="text-foreground">Nᵗₓ = ΔT × Σₖ (Q̄₁₁α₁ + Q̄₁₂α₂) × tₖ</p>
                <p className="text-foreground">Nᵗᵧ = ΔT × Σₖ (Q̄₁₂α₁ + Q̄₂₂α₂) × tₖ</p>
                <p className="text-foreground">Nᵗₓᵧ = ΔT × Σₖ (Q̄₁₆α₁ + Q̄₂₆α₂) × tₖ</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Thermal Strains</h3>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono space-y-1">
                <p className="text-foreground">εᵗ₁ = α₁ × ΔT</p>
                <p className="text-foreground">εᵗ₂ = α₂ × ΔT</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Where α₁ and α₂ are coefficients of thermal expansion in material axes.
              </p>
            </div>
          </div>
        </Card>

        {/* Buckling Analysis */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Buckling Analysis</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Critical Buckling Load (Plates)</h3>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                <p className="text-foreground">Nₓᶜʳ = k × π² × D / b²</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Where k is the buckling coefficient depending on boundary conditions and aspect ratio.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Critical Pressure (Cylindrical Shells)</h3>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                <p className="text-foreground">Pᶜʳ = 2 × Eₜ × (t/r)³ / [√(3(1-ν²))]</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                For external pressure on thin-walled cylinders, where r is radius and t is thickness.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Effective Bending Stiffness</h3>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono space-y-1">
                <p className="text-foreground">Dₑff = [(D₁₁D₂₂)⁰·⁵ + D₁₂ + 2D₆₆]</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Interlaminar Stresses */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Interlaminar Stress Analysis</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Out-of-Plane Shear Stresses</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Calculated using equilibrium equations at ply interfaces:
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono space-y-1">
                <p className="text-foreground">∂τₓz/∂z = -∂σₓ/∂x - ∂τₓᵧ/∂y</p>
                <p className="text-foreground">∂τᵧz/∂z = -∂τₓᵧ/∂x - ∂σᵧ/∂y</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Interface Stress Concentration</h3>
              <p className="text-sm text-muted-foreground">
                Peak interlaminar stresses occur at ply interfaces with large property mismatches, 
                particularly at free edges where delamination typically initiates.
              </p>
            </div>
          </div>
        </Card>

        {/* Progressive Failure */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Progressive Failure Analysis</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Material Degradation Model</h3>
              <p className="text-sm text-muted-foreground mb-3">
                When a ply fails, its stiffness is degraded:
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono space-y-1">
                <p className="text-foreground">E₁ᵈᵉᵍ = 0.1 × E₁</p>
                <p className="text-foreground">E₂ᵈᵉᵍ = 0.1 × E₂</p>
                <p className="text-foreground">G₁₂ᵈᵉᵍ = 0.1 × G₁₂</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Typically 90% stiffness reduction for failed plies.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Load Redistribution</h3>
              <p className="text-sm text-muted-foreground">
                After each ply failure, loads are redistributed to remaining intact plies. 
                Analysis continues until ultimate failure or all plies have failed. The ultimate 
                strength is the load at last ply failure.
              </p>
            </div>
          </div>
        </Card>

        {/* Advanced Analysis */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Advanced Analysis Features</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Progressive Failure Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Simulates the progressive degradation of the laminate by reducing stiffness of failed plies 
                and redistributing loads until ultimate failure or all plies fail.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Buckling Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Calculates critical buckling loads for plates and cylindrical shells under various loading conditions 
                using eigenvalue analysis of the stiffness matrices.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Thermal Stress Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Evaluates thermally-induced stresses due to temperature changes, accounting for different 
                coefficients of thermal expansion in each ply direction.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Interlaminar Stress Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Calculates out-of-plane shear and normal stresses between plies, which are critical for 
                delamination failure prediction.
              </p>
            </div>
          </div>
        </Card>

        {/* How to Use */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">How to Use This Application</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 1: Material Selection</h3>
              <p className="text-sm text-muted-foreground">
                Choose from predefined materials or create custom materials by defining their mechanical properties 
                (E₁, E₂, G₁₂, ν₁₂, strength values, density, thickness).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 2: Build Ply Stack</h3>
              <p className="text-sm text-muted-foreground">
                Add plies to your laminate by selecting materials and defining fiber orientation angles. 
                The order matters - plies are numbered from bottom to top.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 3: Review Properties</h3>
              <p className="text-sm text-muted-foreground">
                Check the "Properties" tab to view the ABD stiffness matrix, equivalent engineering properties, 
                and cross-section visualization of your laminate.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 4: Define Loading</h3>
              <p className="text-sm text-muted-foreground">
                In the "Stress" tab, select geometry type (flat plate, tube, or pressure vessel), then input 
                force resultants (Nx, Ny, Nxy) and moment resultants (Mx, My, Mxy).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 5: Run Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Click "Calculate Stress/Strain" to perform the analysis. Results include ply-by-ply stresses, 
                strains, and failure indices. View visualizations in the "Visualization" tab.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 6: Failure Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Switch to the "Failure" tab to configure failure criteria, safety factors, and enable advanced 
                analysis options (thermal, buckling, progressive failure).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 7: Save & Compare</h3>
              <p className="text-sm text-muted-foreground">
                Save your configurations for future use and compare different laminate designs in the "Stacks" 
                tab to optimize your design. Use "Load Cases" to save different loading scenarios.
              </p>
            </div>
          </div>
        </Card>

        {/* Credits */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Development Credits</h2>
            <Separator className="my-4" />
            <p className="text-lg text-foreground font-semibold">
              Developed by PhD Candidate Ursache Stefan
            </p>
            <p className="text-lg text-foreground font-semibold">
              Co-authored by Vlad Nitoiu
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This tool represents cutting-edge research in composite materials analysis and design optimization.
            </p>
          </div>
        </Card>
      </div>
    </ScrollArea>
  );
}

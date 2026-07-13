"""
risk_service.py
Risk Assessment Module - Member: Sonia
Combines a Density Level (from density_service.py) with a Motion Level
(from motion_service.py) into a single rule-based Risk Level.

Rule table:
    Density HIGH    + Motion HIGH    -> HIGH RISK
    Density MEDIUM  + Motion MEDIUM  -> WARNING
    Density HIGH    + Motion MEDIUM  -> WARNING
    Density MEDIUM  + Motion HIGH    -> WARNING
    otherwise                        -> NORMAL
"""


class RiskService:
    """
    Rule-based risk classification engine.
    Takes density level + motion level -> produces an overall risk level.
    """

    LEVEL_ORDER = {"LOW": 0, "MEDIUM": 1, "HIGH": 2}

    RISK_HIGH = "HIGH RISK"
    RISK_WARNING = "WARNING"
    RISK_NORMAL = "NORMAL"

    def _level_value(self, level):
        """Convert a LOW/MEDIUM/HIGH string into a numeric value for comparison."""
        return self.LEVEL_ORDER.get(level.upper(), 0)

    def assess_risk(self, density_level, motion_level):
        """
        Apply the rule-based logic described in the project spec.

        Args:
            density_level (str): "LOW", "MEDIUM", or "HIGH"
            motion_level (str): "LOW", "MEDIUM", or "HIGH"

        Returns:
            dict: {
                "risk_level": "NORMAL" | "WARNING" | "HIGH RISK",
                "density_level": str,
                "motion_level": str,
                "message": str
            }
        """
        d = self._level_value(density_level)
        m = self._level_value(motion_level)

        if d >= 2 and m >= 2:
            risk = self.RISK_HIGH
            message = "High density and high motion detected. Possible stampede risk."
        elif d >= 1 and m >= 1:
            risk = self.RISK_WARNING
            message = "Elevated density and/or motion detected. Monitor closely."
        else:
            risk = self.RISK_NORMAL
            message = "Crowd conditions are within normal limits."

        return {
            "risk_level": risk,
            "density_level": density_level.upper(),
            "motion_level": motion_level.upper(),
            "message": message
        }

    def assess_from_scores(self, density_score, motion_score,
                            density_thresholds=(0.3, 0.7),
                            motion_thresholds=(1.5, 4.0)):
        """
        Optional helper: classify raw numeric scores into LOW/MEDIUM/HIGH
        levels first, then run the same rule-based risk logic. Useful if
        you want to skip calling density_service/motion_service separately
        and just pass raw numbers straight into risk assessment.

        Args:
            density_score (float): people_count / frame_area
            motion_score (float): average optical flow magnitude
            density_thresholds (tuple): (low_max, medium_max) cutoffs for density
            motion_thresholds (tuple): (low_max, medium_max) cutoffs for motion

        Returns:
            dict: same shape as assess_risk()
        """
        d_low, d_high = density_thresholds
        m_low, m_high = motion_thresholds

        density_level = (
            "LOW" if density_score < d_low else
            "MEDIUM" if density_score < d_high else
            "HIGH"
        )
        motion_level = (
            "LOW" if motion_score < m_low else
            "MEDIUM" if motion_score < m_high else
            "HIGH"
        )

        return self.assess_risk(density_level, motion_level)


if __name__ == "__main__":
    # Quick manual test of the rule table
    risk_service = RiskService()

    test_cases = [
        ("LOW", "LOW"),
        ("MEDIUM", "MEDIUM"),
        ("HIGH", "HIGH"),
        ("HIGH", "LOW"),
        ("LOW", "HIGH"),
        ("HIGH", "MEDIUM"),
    ]

    for density, motion in test_cases:
        result = risk_service.assess_risk(density, motion)
        print(f"Density={density:<6} Motion={motion:<6} -> "
              f"{result['risk_level']:<10} | {result['message']}")

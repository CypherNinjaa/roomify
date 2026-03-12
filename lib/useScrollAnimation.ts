import { useEffect } from "react";

export function useScrollAnimation() {
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("visible");
						observer.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.1 },
		);

		const targets = document.querySelectorAll(
			".animate-on-scroll, .animate-scale-on-scroll",
		);
		targets.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	}, []);
}

import { useEffect } from "react";

export function useScrollAnimation() {
	useEffect(() => {
		const elements = document.querySelectorAll(
			".animate-on-scroll, .animate-scale-on-scroll",
		);

		if (elements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("visible");
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
		);

		elements.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	}, []);
}

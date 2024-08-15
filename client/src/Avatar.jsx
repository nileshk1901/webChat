export default function Avatar({ online,username, userId }) {
    const colors = [
			"bg-gray-500",
			"bg-red-500",
			"bg-yellow-500",
			"bg-green-500",
			"bg-blue-500",
			"bg-pink-500",
			"bg-teal-500",
			"bg-cyan-500",
			"bg-lime-500",
			"bg-orange-500",
			
			"bg-emerald-500",
			
			
			"bg-violet-500",
			"bg-sky-500",
			"bg-stone-500",
			
    ];
    const userIdBase10 = parseInt(userId, 16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];



    return (
			<div
				className={
					"w-8 h-8 relative border rounded-full flex items-center " + color
				}
			>
				<div className="text-center text-lg w-full opacity-70">
					{username[0].toUpperCase()}
				</div>
				{online && (
					<div className="absolute w-3 h-3 border rounded-full bg-orange-400 bottom-0 right-0"></div>
				)}
			</div>
		);
}
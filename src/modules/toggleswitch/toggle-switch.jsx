import React, { useState, useEffect } from "react";
import "./toggle-switch.css";

const ToggleSwitch = ({ label, status, onToggleChange, className, disabled }) => {
	// State to hold the toggle switch value (Active or Inactive)
	const [internalStatus, setInternalStatus] = useState(status);
	useEffect(() => {
		// Update the internalStatus state whenever the status prop changes
		setInternalStatus(status);
	}, [status]);

	const handleToggle = () => {
		const newStatus = !internalStatus;
		setInternalStatus(newStatus);
		// Call the onToggleChange callback with the new status value
		onToggleChange(newStatus);
	};

	return (
		<div className={className}>
			<div>{label}</div>
			<div className="toggle-switch">
				<input
					type="checkbox"
					className="checkbox"
					name={label}
					id={label}
					checked={internalStatus}
					onChange={handleToggle}
					disabled={disabled}
				/>
				<label className="label" htmlFor={label}>
					<span className="inner" />
					<span className="switch" />
				</label>
			</div>
		</div>
	);
};

export default ToggleSwitch;

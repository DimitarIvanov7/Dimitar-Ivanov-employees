import React, { useState } from "react";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

function App() {
	const [file, setFile] = useState();
	const [array, setArray] = useState([]);

	const fileReader = new FileReader();

	const handleOnChange = (e) => {
		setFile(e.target.files[0]);
	};

	const csvFileToArray = (string) => {
		const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
		const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

		const array = csvRows.map((i) => {
			const values = i.split(",");
			const obj = csvHeader.reduce((object, header, index) => {
				object[header] = values[index];
				return object;
			}, {});
			return obj;
		});

		setArray(getDaysInfo(array));
	};

	const getDaysInfo = (array) => {
		const getDate = (strDate) => {
			if (strDate.includes("NULL")) return moment().toDate();

			let date = moment(strDate, "YYYY-MM-DD");

			return date.toDate();
		};

		const calculateDays = (fromA, toA, fromB, toB) => {
			let distance = 0;

			if (fromA >= fromB && toA <= toB) {
				distance = toA - fromA;
			} else if (fromA < fromB && toA > toB) {
				distance = toB - fromB;
			} else if (fromA <= fromB && toA <= toB) {
				distance = toA - fromB;
			} else if (fromA > fromB && toA >= toB) {
				distance = toB - fromA;
			}

			return Math.round(distance / 86400000);
		};

		if (array.length === 0) return ["No data"];

		let keyValArr = [];

		array.forEach((element) => {
			const keys = Object.keys(element);

			const splitKeys = keys[0].split(";");

			const values = Object.values(element);

			const splitVals = values[0].split(";");

			keyValArr.push([splitKeys, splitVals]);
		});

		if (keyValArr.length === 0) return ["No data"];

		const objArr = keyValArr.map((arr) => {
			if (arr[1].length < 4) return;
			return {
				EmpID: arr[1][0],
				ProjectID: arr[1][1],
				DateFrom: getDate(arr[1][2]),
				DateTo: getDate(arr[1][3]),
			};
		});

		if (objArr.length === 0) return ["No data"];

		let sameProjectsWork = [];

		for (let i = 0; i < objArr.length; i++) {
			for (let m = i + 1; m < objArr.length; m++) {
				if (
					objArr[i] &&
					objArr[m] &&
					objArr[i].ProjectID === objArr[m].ProjectID
				) {
					if (objArr[i].EmpID !== objArr[m].EmpID) {
						if (
							objArr[i].DateFrom <= objArr[m].DateTo &&
							objArr[m].DateFrom <= objArr[i].DateTo
						) {
							sameProjectsWork.push([objArr[i], objArr[m]]);
						}
					}
				}
			}
		}

		if (sameProjectsWork.length === 0) return ["No data"];

		let finalData = [];

		sameProjectsWork.forEach((arr) => {
			finalData.push({
				EmpID_1: arr[0].EmpID,
				EmpID_2: arr[1].EmpID,
				ProjectID: arr[0].ProjectID,
				Days: calculateDays(
					arr[0].DateFrom,
					arr[0].DateTo,
					arr[1].DateFrom,
					arr[1].DateTo
				),
			});
		});

		if (finalData.length === 0) return ["No data"];

		let maxValue = finalData.reduce((max, data) =>
			max.Days > data.Days ? max : data
		);

		// console.log(maxValue);

		return [maxValue];
	};

	const handleOnSubmit = (e) => {
		e.preventDefault();

		if (file) {
			fileReader.onload = function (event) {
				const text = event.target.result;
				csvFileToArray(text);
			};

			fileReader.readAsText(file, "ISO-8859-3");
		}
	};

	const headerKeys = Object.keys(Object.assign({}, ...array));

	return (
		<div style={{ textAlign: "center" }}>
			<h3 style={{ marginBottom: "2rem" }}>
				Identify the pair of employees who have worked together on common
				projects for the longest period of time
			</h3>
			<form>
				<input
					type={"file"}
					id={"csvFileInput"}
					accept={".csv"}
					onChange={handleOnChange}
				/>

				<button
					onClick={(e) => {
						handleOnSubmit(e);
					}}
				>
					IMPORT CSV
				</button>
			</form>

			<br />

			<h3>Data:</h3>

			<table style={{ margin: "2rem auto" }}>
				<thead>
					<tr key={uuidv4()}>
						{headerKeys.map((key) => (
							<th key={uuidv4()} style={{ paddingLeft: "1rem" }}>
								{key}
							</th>
						))}
					</tr>
				</thead>

				<tbody>
					{array.map((item) => (
						<tr key={uuidv4()}>
							{Object.values(item).map((val) => (
								<td key={uuidv4()} style={{ paddingLeft: "1rem" }}>
									{val}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default App;

import React, { useState } from "react";
import moment from "moment";

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

		setArray(array);

		createProperObj(array);
	};

	console.log(array);

	const createProperObj = (array) => {
		const getDate = (strDate) => {
			if (strDate.includes("NULL")) return moment().toDate();

			let date = moment(strDate, "YYYY-MM-DD");

			return date.toDate();
		};

		let twoDArr = [];

		array.forEach((element) => {
			const keys = Object.keys(element);

			const splitKeys = keys[0].split(";");

			const values = Object.values(element);

			const splitVals = values[0].split(";");

			twoDArr.push([splitKeys, splitVals]);
		});

		console.log(twoDArr);

		const obj = twoDArr.map((arr) => {
			if (arr[1].length < 4) return;
			return {
				EmpID: arr[1][0],
				ProjectID: arr[1][1],
				DateFrom: getDate(arr[1][2]),
				DateTo: getDate(arr[1][3]),
			};
		});

		console.log(obj);

		let sameProjects = [];

		for (let i = 0; i < obj.length; i++) {
			for (let m = i + 1; m < obj.length; m++) {
				if (obj[i] && obj[m] && obj[i].ProjectID === obj[m].ProjectID) {
					if (obj[i].EmpID !== obj[m].EmpID) {
						sameProjects.push([obj[i], obj[m]]);
					}
				}
			}
		}

		console.log(sameProjects);

		let strDate = sameProjects[0][0].DateFrom;
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
			<h1>REACTJS CSV IMPORT EXAMPLE </h1>
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

			<table>
				<thead>
					<tr key={"header"}>
						{headerKeys.map((key) => (
							<th>{key}</th>
						))}
					</tr>
				</thead>

				<tbody>
					{array.map((item) => (
						<tr key={item.id}>
							{Object.values(item).map((val) => (
								<td>{val}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default App;

import React from "react";
import "./SourceTable.css";

export default function SourceTable({ srcMap, totals, onSourceClick }) {
  const rows = Object.entries(srcMap).sort((a, b) => b[1].pol - a[1].pol);

  return (
    <div className="st-wrap">
      <table className="st-table">
        <thead>
          <tr>
            <th className="th-src">Source</th>
            <th>Positive</th>
            <th>Negative</th>
            <th>Neutral</th>
            <th className="th-pol">Politically<br />Relevant</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([src, d]) => (
            <tr
              key={src}
              className="st-row"
              onClick={() => onSourceClick(src)}
              title={`Click to view ${src} articles`}
            >
              <td className="td-src">{src}</td>
              <td className="td-pos">{d.pos}</td>
              <td className="td-neg">{d.neg}</td>
              <td className="td-neu">{d.neu}</td>
              <td className="td-pol">{d.pol}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="st-total">
            <td>Total</td>
            <td>{totals.pos}</td>
            <td>{totals.neg}</td>
            <td>{totals.neu}</td>
            <td>{totals.pol}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

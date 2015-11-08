'use strict';
import React from 'react';
import { LineChart } from 'react-d3';

class WeightsApp extends React.Component {
    constructor(props) {
        console.log('constructor', 'before');
        super(props);
        this.state = {weights:[]};
        console.log('constructor', 'after');
    }

    componentWillMount() {
        console.log('componentWillMount', 'before');
        var arWeights = [];
        fetch('http://localhost/oscardc/weights')
        .then((response) => {
            return response.json();
        })
        .then((weights) => {
            var min = weights[0];
            var max = weights[0];

            arWeights = weights.map((elem) => {
                // Delete _id and instead just save the date, removing the user name
                var entry = {
                    date: new Date(elem._id.date),
                    weight: elem.weight
                };

                // Check for min and max weight to mark them later
                if(elem.weight < min.weight) min = entry;
                if(elem.weight > max.weight) max = entry;

                return entry;
            });
            // Add a flat to min max entries
            min.min = true;
            max.max = true;
            this.setState( {weights: arWeights} );
        });
        console.log('componentWillMount', 'after');
    }

    render(){
        console.log('render', this.state);
        if(this.state.weights.length === 0) {
            return <p className="text-center">Loading weights...</p>;
        }
        // else
        // Chart data
        const chartViewBox = {x: 0, y: 0, width: 1000, height: 400};
        var chartData = this._getChartData();
        return (
            <div>
                <LineChart title="Your weight chart" legend={true} data={chartData} width='100%' height={400} viewBoxObject={chartViewBox}
                    yAxisLabel="Weight" xAxisLabel="Date" gridHorizontal={true} />
                <table className="table table-condensed">
                    <thead>
                        <tr>
                            <th>Weight</th>
                            <th>Year</th>
                            <th>Month</th>
                            <th>Day</th>
                        </tr>
                    </thead>
                    <tbody>
                         {this.state.weights.map(this._renderRow)}
                    </tbody>
                </table>
            </div>
        );
    }

    _renderRow(elem, index){
        let date = elem.date;
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        let key = year+'-'+month+'-'+day;

        // type: Bootstrap row class
        let type = '';
        if(!!elem.min && !elem.max) type = 'success'; // The double check should avoid strange behaviour when there's only one row
        if(!!elem.max && !elem.min) type = 'danger';

        return (
           <tr key={key} className={type}>
               <td>{elem.weight}</td>
               <td>{year}</td>
               <td>{month}</td>
               <td>{day}</td>
           </tr>
       );
    }

    _getChartData(){
        var vals = this.state.weights.reverse().map(function(elem,index){
            return {
                x: elem.date,
                y: elem.weight
            };
        });
        return  [{
            name: "Weights",
            values: vals,
            strokeWidth: 2
        }];
  ;
    }

}

export default WeightsApp

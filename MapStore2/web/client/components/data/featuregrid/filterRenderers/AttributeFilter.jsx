
/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import React from 'react';

import PropTypes from 'prop-types';
import { getMessageById } from '../../../../utils/LocaleUtils';
import { Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../../../misc/OverlayTrigger';
import ComboField from '../../query/ComboField';

class AttributeFilter extends React.PureComponent {
    static propTypes = {
        valid: PropTypes.bool,
        disabled: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        value: PropTypes.any,
        column: PropTypes.object,
        placeholderMsgId: PropTypes.string,
        tooltipMsgId: PropTypes.string,
        defaultOperator: PropTypes.string,
        type: PropTypes.string,
        isWithinAttrTbl: PropTypes.bool,
        // data for dropdown value 
        features: PropTypes.array
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        value: '',
        valid: true,
        onChange: () => {},
        column: {},
        placeholderMsgId: "featuregrid.filter.placeholders.default",
        defaultOperator: "=",
        isWithinAttrTbl: false,
        //for passing features
        features: {}
    };
    constructor(props) {
        super(props);
        this.state = {
            listOperators: ["="],
            stringOperators: ["=", "<>", "like", "ilike", "isNull"],
            arrayOperators: ["contains"],
            booleanOperators: ["="],
            defaultOperators: ["=", ">", "<", ">=", "<=", "<>", "isNull"],
            timeDateOperators: ["=", ">", "<", ">=", "<=", "<>", "><", "isNull"],
            operator: this.props.isWithinAttrTbl ? (this.props.defaultOperator) : "",
            isInputValid: true,
            features: {this:props.features},//get features from props
            uniqueValues: [],  //unique col values for dropdown
            showList: false //NOT ORIGINAL
        };
    }

    // code for getting dropdown values
    componentDidMount() {
        console.log("feature:", this.props.features);
        console.log("column key:", this.props.column.key);
        this.fetchUniqueValues();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.features !== this.props.features || prevProps.column.key !== this.props.column.key) {
            this.fetchUniqueValues();
        }
    }

    fetchUniqueValues = () => {
        const { features, column } = this.props; // `features` should be passed as a prop containing the table's data
        
        if (!features || features.length === 0) {
            console.warn("Features are empty or undefined.");
            this.setState({ uniqueValues: [] });
            return;
        }
    
        if (!column || !column.key) {
            console.warn("Column key is undefined.");
            this.setState({ uniqueValues: [] });
            return;
        }

        console.log("fetching unique values for column:", column?.key);
        console.log("features data:", features);

        const rawvals = features.map(row => row.properties?.[column.key]);
        console.log("RAW values from features:", rawvals);
        
        if (features && column && column.key) {
            const uniqueValues = [...new Set(rawvals.filter(val => val !== undefined && val !== null))];
            console.log("unique values:", uniqueValues);
            this.setState({ uniqueValues });
        }
    };


    getOperator = (type) => {
        switch (type) {
        case "list": {
            return this.state.listOperators;
        }
        case "string": {
            return this.state.stringOperators;
        }
        case "boolean": {
            return this.state.booleanOperators;
        }
        case "array": {
            return this.state.arrayOperators;
        }
        case "date":
        case "time":
        case "date-time":
        {
            return this.state.timeDateOperators;
        }
        default:
            return this.state.defaultOperators;
        }
    };

    renderInput = () => {
        if (this.props.column.filterable === false) {
            return <span/>;
        }
        const placeholder = getMessageById(this.context.messages, this.props.placeholderMsgId) || "Search";
        let inputKey = 'header-filter-' + this.props.column.key;
        let isValueExist = this.state?.value ?? this.props.value;
        if (this.isDateTimeField() && this.props.isWithinAttrTbl) isValueExist = this.state?.value ?? this.props.value?.startDate ?? this.props.value;
        let isNullOperator = this.state.operator === 'isNull';
        return (<div className={`rw-widget ${this.state.isInputValid ? "" : "show-error"}`}>
            <input
                disabled={this.props.disabled || isNullOperator}
                key={inputKey}
                type="text"
                className={"form-control input-sm"}
                placeholder={placeholder}
                value={isValueExist}
                onChange={this.handleChange}
                style={{
                    width: '90%',
                    display: 'inline'
                }}/>

            <div style={{ display: 'inline', width: '10%'}}>
                <button 
                    style={{ background: '@ms-main-bg', border: 'rgb(51, 51, 51)', color: '@ms-main-color' }}
                    onClick={() => this.setState(prevState => ({ showList: !prevState.showList }))}
                >
                    ▼
                </button>
                <ul style={{ display: this.state.showList ? 'block' : 'none', listStyleType: 'none', padding: 0, position: 'absolute', zIndex: '9999', right: '0', background:'white', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                {this.state.uniqueValues.length > 0 ? (
                        this.state.uniqueValues.map((value, index) => (
                            <li
                                key={index}
                                style={{
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease'
                                }}
                                onClick={() => {
                                    this.handleChange({ target: { value: value } });
                                    this.setState({ showList: false });
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                {value}
                            </li>
                        ))
                    ) : (
                        <li style={{ padding: '8px 16px' }}>No values available</li>
                    )}

                </ul>
            </div>

        </div>);
    }

    renderTooltip = (cmp) => {
        if (this.props.tooltipMsgId && getMessageById(this.context.messages, this.props.tooltipMsgId)) {
            return (<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{getMessageById(this.context.messages, this.props.tooltipMsgId)}</Tooltip>}>
                {cmp}
            </OverlayTrigger>);
        }
        return cmp;
    }
    renderOperatorField = () => {
        return (
            <ComboField
                style={{ width: 90 }}
                fieldOptions= {this.getOperator(this.props.type)}
                fieldName="operator"
                fieldRowId={1}
                disabled={this.props.disabled}
                onSelect={(selectedOperator)=>{
                    // if select the same operator -> don't do anything
                    if (selectedOperator === this.state.operator) return;
                    let isValueExist;           // entered value
                    if (this.isDateTimeField()) {
                        isValueExist = this.state?.value ?? this.props.value?.startDate ?? this.props.value;
                    } else {
                        isValueExist = this.state?.value ?? this.props.value;
                    }
                    let isNullOperatorSelected = selectedOperator === 'isNull';
                    let isOperatorChangedFromRange = this.state.operator === '><';
                    // set the selected operator + value and reset the value in case of isNull
                    this.setState({ operator: selectedOperator, value: (isNullOperatorSelected || isOperatorChangedFromRange) ? undefined : isValueExist });
                    // get flag of being (operator was isNull then changes to other operator)
                    let isOperatorChangedFromIsNull = this.state.operator === 'isNull' && selectedOperator !== 'isNull';
                    // apply filter if value exists 'OR' operator = isNull 'OR' (prev operator was isNull and changes --> reset filter)
                    if (isNullOperatorSelected || isOperatorChangedFromIsNull || isOperatorChangedFromRange) {
                        // reset data --> operator = isNull 'OR' (prev operator was isNull and changes)
                        this.props.onChange({value: null, attribute: this.props.column && this.props.column.key, inputOperator: selectedOperator});
                    } else if (isValueExist) {
                        // apply filter --> if value exists
                        this.props.onChange({value: isValueExist, attribute: this.props.column && this.props.column.key, inputOperator: selectedOperator});
                    }
                }}
                fieldValue={this.state.operator}
                onUpdateField={() => {}}/>
        );
    };
    render() {
        let inputKey = 'header-filter--' + this.props.column.key;
        return (
            <div key={inputKey} className={`form-group${((this.state.isInputValid && this.props.valid) ? "" : " has-error")}`}>
                {this.props.isWithinAttrTbl ? <>
                    {this.renderOperatorField()}
                    {this.isDateTimeField() ? this.renderInput() : this.renderTooltip(this.renderInput())}
                </> : this.renderTooltip(this.renderInput())}
            </div>
        );
    }
    isDateTimeField = () => {
        return ['date', 'time', 'date-time'].includes(this.props.type);
    }
    handleChange = (e) => {
        const value = e.target.value;
        // todo: validate input based on type
        let isValid = true;
        if (this.props.isWithinAttrTbl) {
            const match = /\s*(!==|!=|<>|<=|>=|===|==|=|<|>)?(.*)/.exec(value);
            if (match[1]) isValid = false;
            if (match[2]) {
                if (['integer', 'number'].includes(this.props.type) && isNaN(match[2])) isValid = false;
            }
        }
        this.setState({value, isInputValid: isValid});
        if (isValid) {
            this.props.onChange({value, attribute: this.props.column && this.props.column.key, inputOperator: this.state.operator});
        }
    }
}

export default AttributeFilter;






// /**
//   * Copyright 2017, GeoSolutions Sas.
//   * All rights reserved.
//   *
//   * This source code is licensed under the BSD-style license found in the
//   * LICENSE file in the root directory of this source tree.
//   */

// import React from 'react';

// import PropTypes from 'prop-types';
// import { getMessageById } from '../../../../utils/LocaleUtils';
// import { Tooltip } from 'react-bootstrap';
// import OverlayTrigger from '../../../misc/OverlayTrigger';
// import ComboField from '../../query/ComboField';


// class AttributeFilter extends React.PureComponent {
//     static propTypes = {
//         valid: PropTypes.bool,
//         disabled: PropTypes.bool,
//         onChange: PropTypes.func.isRequired,
//         value: PropTypes.any,
//         column: PropTypes.object,
//         placeholderMsgId: PropTypes.string,
//         tooltipMsgId: PropTypes.string,
//         defaultOperator: PropTypes.string,
//         type: PropTypes.string,
//         isWithinAttrTbl: PropTypes.bool,
//         // data for dropdown value 
//         features: PropTypes.array
//     };

//     static contextTypes = {
//         messages: PropTypes.object
//     };

//     static defaultProps = {
//         value: '',
//         valid: true,
//         onChange: () => {},
//         column: {},
//         placeholderMsgId: "featuregrid.filter.placeholders.default",
//         defaultOperator: "=",
//         isWithinAttrTbl: false,
//         //for passing features

//         features: {}
//     };
//     constructor(props) {
//         super(props);
//         this.state = {
//             listOperators: ["="],
//             stringOperators: ["=", "<>", "like", "ilike", "isNull"],
//             arrayOperators: ["contains"],
//             booleanOperators: ["="],
//             defaultOperators: ["=", ">", "<", ">=", "<=", "<>", "isNull"],
//             timeDateOperators: ["=", ">", "<", ">=", "<=", "<>", "><", "isNull"],
//             operator: this.props.isWithinAttrTbl ? (this.props.defaultOperator) : "",
//             isInputValid: true,
//             features: {this:props.features},//get features from props
//             //unique col values for dropdown
//             uniqueValues: []
//         };
//     }

//     // code for getting dropdown values
//     componentDidMount() {
//         console.log("feature:", this.props.features);
//         console.log("column key:", this.props.column.key);
//         this.fetchUniqueValues();
//     }

//     componentDidUpdate(prevProps) {
//         if (prevProps.features !== this.props.features || prevProps.column.key !== this.props.column.key) {
//             this.fetchUniqueValues();
//         }
//     }

//     fetchUniqueValues = () => {
//         const { features, column } = this.props; // `features` should be passed as a prop containing the table's data
        
//         if (!features || features.length === 0) {
//             console.warn("Features are empty or undefined.");
//             this.setState({ uniqueValues: [] });
//             return;
//         }
    
//         if (!column || !column.key) {
//             console.warn("Column key is undefined.");
//             this.setState({ uniqueValues: [] });
//             return;
//         }

//         console.log("fetching unique values for column:", column?.key);
//         console.log("features data:", features);

//         const rawvals = features.map(row => row.properties?.[column.key]);
//         console.log("RAW values from features:", rawvals);
        
//         if (features && column && column.key) {
//             const uniqueValues = [...new Set(rawvals.filter(val => val !== undefined && val !== null))];
//             console.log("unique values:", uniqueValues);
//             this.setState({ uniqueValues });
//         }
//     };
// //

//     getOperator = (type) => {
//         switch (type) {
//         case "list": {
//             return this.state.listOperators;
//         }
//         case "string": {
//             return this.state.stringOperators;
//         }
//         case "boolean": {
//             return this.state.booleanOperators;
//         }
//         case "array": {
//             return this.state.arrayOperators;
//         }
//         case "date":
//         case "time":
//         case "date-time":
//         {
//             return this.state.timeDateOperators;
//         }
//         default:
//             return this.state.defaultOperators;
//         }
//     };


//     renderInput = () => {
//         if (this.props.column.filterable === false) {
//             return <span/>;
//         }
//         const placeholder = getMessageById(this.context.messages, this.props.placeholderMsgId) || "Search";
//         let inputKey = 'header-filter-' + this.props.column.key;
//         let isValueExist = this.state?.value ?? this.props.value;
//         if (this.isDateTimeField() && this.props.isWithinAttrTbl) isValueExist = this.state?.value ?? this.props.value?.startDate ?? this.props.value;
//         let isNullOperator = this.state.operator === 'isNull';
//         return (
//             <div className={`rw-widget ${this.state.isInputValid ? "" : "show-error"}`}>
//                 <input
//                     disabled={this.props.disabled || isNullOperator}
//                     key={inputKey}
//                     type="text"
//                     className={"form-control input-sm"}
//                     placeholder={placeholder}
//                     value={isValueExist}
//                     onChange={this.handleChange}/>

//                 <select 
//                     className="form-control input-sm" 
//                     style={{ width: '150px' }} // Adjust width as needed
//                     onChange={this.handleChange}
//                     value = {this.state.value}
//                 >
//                     {/* <option value="">Select Option</option> */}
//                     {this.state.uniqueValues.map((value, index) => (
//                         <option key={index} value={value}>{value}</option>
//                     ))}
//                     {/* <option value="">Select Option</option>
//                     <option value="DE">DE</option>
//                     <option value="MD">MD</option>
//                     <option value="VA">VA</option> */}
//                 </select>

//             </div>
//         );
//     }
//     renderTooltip = (cmp) => {
//         if (this.props.tooltipMsgId && getMessageById(this.context.messages, this.props.tooltipMsgId)) {
//             return (<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{getMessageById(this.context.messages, this.props.tooltipMsgId)}</Tooltip>}>
//                 {cmp}
//             </OverlayTrigger>);
//         }
//         return cmp;
//     }
//     renderOperatorField = () => {
//         return (
//             <ComboField
//                 style={{ width: 90 }}
//                 fieldOptions= {this.getOperator(this.props.type)}
//                 fieldName="operator"
//                 fieldRowId={1}
//                 disabled={this.props.disabled}
//                 onSelect={(selectedOperator)=>{
//                     // if select the same operator -> don't do anything
//                     if (selectedOperator === this.state.operator) return;
//                     let isValueExist;           // entered value
//                     if (this.isDateTimeField()) {
//                         isValueExist = this.state?.value ?? this.props.value?.startDate ?? this.props.value;
//                     } else {
//                         isValueExist = this.state?.value ?? this.props.value;
//                     }
//                     let isNullOperatorSelected = selectedOperator === 'isNull';
//                     let isOperatorChangedFromRange = this.state.operator === '><';
//                     // set the selected operator + value and reset the value in case of isNull
//                     this.setState({ operator: selectedOperator, value: (isNullOperatorSelected || isOperatorChangedFromRange) ? undefined : isValueExist });
//                     // get flag of being (operator was isNull then changes to other operator)
//                     let isOperatorChangedFromIsNull = this.state.operator === 'isNull' && selectedOperator !== 'isNull';
//                     // apply filter if value exists 'OR' operator = isNull 'OR' (prev operator was isNull and changes --> reset filter)
//                     if (isNullOperatorSelected || isOperatorChangedFromIsNull || isOperatorChangedFromRange) {
//                         // reset data --> operator = isNull 'OR' (prev operator was isNull and changes)
//                         this.props.onChange({value: null, attribute: this.props.column && this.props.column.key, inputOperator: selectedOperator});
//                     } else if (isValueExist) {
//                         // apply filter --> if value exists
//                         this.props.onChange({value: isValueExist, attribute: this.props.column && this.props.column.key, inputOperator: selectedOperator});
//                     }
//                 }}
//                 fieldValue={this.state.operator}
//                 onUpdateField={() => {}}/>
//         );
//     };
//     render() {
//         console.log("rendering uniquevalues: ", this.state.uniqueValues);
//         let inputKey = 'header-filter--' + this.props.column.key;
//         return (
//             <div key={inputKey} className={`form-group${((this.state.isInputValid && this.props.valid) ? "" : " has-error")}`}>
//                 {this.props.isWithinAttrTbl ? <>
//                     {this.renderOperatorField()}
//                     {this.isDateTimeField() ? this.renderInput() : this.renderTooltip(this.renderInput())}
//                 </> : this.renderTooltip(this.renderInput())}
//             </div>
//         );
//     }
//     isDateTimeField = () => {
//         return ['date', 'time', 'date-time'].includes(this.props.type);
//     }
//     handleChange = (e) => {
//         const value = e.target.value;
//         // todo: validate input based on type
//         let isValid = true;
//         if (this.props.isWithinAttrTbl) {
//             const match = /\s*(!==|!=|<>|<=|>=|===|==|=|<|>)?(.*)/.exec(value);
//             if (match[1]) isValid = false;
//             if (match[2]) {
//                 if (['integer', 'number'].includes(this.props.type) && isNaN(match[2])) isValid = false;
//             }
//         }
//         this.setState({value, isInputValid: isValid});
//         if (isValid) {
//             this.props.onChange({value, attribute: this.props.column && this.props.column.key, inputOperator: this.state.operator});
//         }
//     }
// }

// export default AttributeFilter;

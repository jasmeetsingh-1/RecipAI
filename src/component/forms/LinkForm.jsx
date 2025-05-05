import React, { useState, useRef, useEffect } from "react";
import "./LinkForm.css";
import axios from "axios";
import config from '../../config/config.json'; // adjust the path as necessary
import invalidLinkAnimation from "../../assets/animations/invalidLinkAnimation.json";

import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Lottie from "lottie-react";

const initialValues = {
  linkInput: "",
};

const LinkFormFormValidator = Yup.object({
  linkInput: Yup.string().required("Please enter valid link."),
});

function LinkForm() {
  const { backendUrl, apiSecretKey } = config;
  const [invalidLinkError, setInvalidLinkError] = useState(false);
  const resetFormRef = useRef(null); 

  const resetAllHandler = () => {
    setInvalidLinkError(false);
    if (resetFormRef.current) {
      resetFormRef.current(); 
    }
  };

  const isValidMediaURL = (url) => {
    const regex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=[\w-]{11}(&[\w=&-]*)?|youtu\.be\/[\w-]{11}(\?[\w=&-]*)?|instagram\.com\/reel\/[\w-]+\/?(\?[\w=&-]*)?)$/;
    return regex.test(url.trim());
  };

  const checkIfVideoExist = (text, platform = "youtube") => {
    let payload = {
      platform:platform,
      content:text,
      secretKey:apiSecretKey
    };
    axios.post(`${backendUrl}/ra-api/content-validate`, payload)
    .then((result)=>{
        console.log("resilt >>>>>>>", result)
        fetchContent(text, "youtube");
    }).catch((error)=>{
        console.log("some error in product api", error);
    })
  }

  const fetchContent = (text, platform = "youtube") => {
    let payload = {
      platform:platform,
      content:text,
      secretKey:apiSecretKey
    };
    axios.post(`${backendUrl}/ra-api/fetch-content`, payload)
    .then((result)=>{
        console.log("resilt >>>>>>>", result)
    }).catch((error)=>{
        console.log("some error in product api", error);
    })
  }

  const linkFormOnSubmitValidator = (values, resetForm) => {
    const isValidInput = isValidMediaURL(values.linkInput);
    setInvalidLinkError(!isValidInput);
    if (!isValidInput) {
      //link is invalid
    }
    checkIfVideoExist(values.linkInput);
  };

  return (
    <div className="ra-linkForm-formik-holder">
      <div
        className={`ra-linkForm-wrapper ${
          invalidLinkError ? "ra-showCase-error" : ""
        }`}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={LinkFormFormValidator}
          onSubmit={(values, { resetForm }) => {
            resetFormRef.current = resetForm;
            linkFormOnSubmitValidator(values, resetForm);
          }}
        >
          {({ values, errors, touched, resetForm }) => {
            resetFormRef.current = resetForm;
            return (
              <Form className="ra-link-form-holder">
                <div className="ra-linkForm-row">
                  <label className="ra-linkForm-label" htmlFor="linkInput">
                    Enter Link
                  </label>
                  <Field
                    type="text"
                    name="linkInput"
                    id="linkInput"
                    className="ra-linkForm-field"
                    value={values.linkInput}
                  />
                  {errors.linkInput && touched.linkInput ? (
                    <span className="ra-linkForm-error-span">
                      {errors.linkInput}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
                <section className="ra-linkForm-buttonHolder">
                  <button type="submit">Submit URL</button>
                </section>
              </Form>
            );
          }}
        </Formik>
      </div>

      {invalidLinkError && (
        <div className="ra-invalidLinkError-wrapper">
          <Lottie
            animationData={invalidLinkAnimation}
            loop={true}
            autoplay={true}
          />
          <section className="ra-invalidLinkError-message">
            <p>
              The link format appears to be incorrect. <br />
              Please check for any typos and try again.
            </p>
            <span onClick={resetAllHandler}>Reset</span>
          </section>
        </div>
      )}
    </div>
  );
}

export default LinkForm;
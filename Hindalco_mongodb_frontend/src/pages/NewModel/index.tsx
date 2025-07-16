import React from "react";
// import LocationForm from "components/Master/LocationForm";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useRecoilState } from "recoil";
import { locFormData, modelsFormData } from "recoil/atom";
import checkRoles from "utils/checkRoles";
import axios from "apis/axios.global";
import { CircularProgress } from "@material-ui/core";
import SingleFormWrapper from "containers/SingleFormWrapper";
import { roles } from "utils/enums";
import getAppUrl from "utils/getAppUrl";
// import PartsForm from "components/Master/PartsForm";
// import ModelsForm from "components/Master/ModelsForm";
import ModelsForm from "components/ModelsForm";

type Props = {};

function NewModel({}: Props) {
  const [formData, setFormData] = useRecoilState(modelsFormData);
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = React.useState(false);

  let isAdmin = checkRoles("admin");
  let isAuditor = checkRoles(roles.AUDITOR);
  let isOrgAdmin = true;
  let isLocAdmin = checkRoles("LOCATION-ADMIN");
  let isMR = checkRoles("MR");
  let isEntityHead = checkRoles("ENTITY-HEAD");
  let isGeneralUser = false;

  let params = useParams();
  let paramArg = params.id;
  let edit = paramArg ? true : false;

  const navigate = useNavigate();

  React.useEffect(() => {
    if (edit) {
      setIsLoading(true);
      if (edit) {
        axios
          .get(`/api/model/getModel/byId/${paramArg}`)
          .then((data) => {
            setFormData(data?.data);
            setIsLoading(false);
          })
          .catch((err) => {
            setIsLoading(false);
            console.error(err);
          });
      }
    } else {
      setFormData({
        modelName: "",
        modelNo: "",
        description: "",
      });
    }
  }, []);
  const handleDiscard = () => {
    setFormData({
      id: formData.id ?? "",
      partNo: "",
      modelName: "",
      modelNo: "",
      description: "",
    });
  };

  const handleSubmit = async () => {
    if (formData.modelName && formData.modelNo) {
      setIsLoading(true);
      if (edit) {
        try {
          let res = await axios.put(`/api/model/${formData.id}`, {
            ...formData,
          });
          setFormData({
            ...formData,
            id: res.data.id,
          });
          setIsLoading(false);
          enqueueSnackbar(`Model Saved Succesfully`, {
            variant: "success",
          });
          setFormData({});
          navigate("/master", {
            state: {
              redirectToTab: "MODELS",
            },
          });
        } catch (err: any) {
          enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
            variant: "error",
          });
          setIsLoading(false);
        }
      } else {
        try {
          let res = await axios.post(`/api/model`, {
            ...formData,
          });
          setFormData({
            ...formData,
            id: res.data.id,
          });
          setIsLoading(false);
          enqueueSnackbar(`Model Created Succesfully`, {
            variant: "success",
          });
          setFormData({});
          navigate("/master", {
            state: {
              redirectToTab: "MODELS",
            },
          });
        } catch (err: any) {
          if (err.response.status === 409) {
            enqueueSnackbar(`Model Already Exists`, {
              variant: "error",
            });
          } else {
            enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
              variant: "error",
            });
          }
          setIsLoading(false);
          navigate("/master", {
            state: {
              redirectToTab: "MODELS",
            },
          });
        }
      }
    } else {
      enqueueSnackbar(`Please Fill all the required fields`, {
        variant: "warning",
      });
    }
  };

  if (!(isLocAdmin || isOrgAdmin || isAdmin)) {
    return (
      <>
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "10%",
            }}
          >
            <CircularProgress />
          </div>
        ) : (
          <SingleFormWrapper
            parentPageLink="/master/parts"
            backBtn={isMR || isEntityHead || isGeneralUser}
            disableFormFunction={
              isMR || isEntityHead || isGeneralUser || isAuditor
            }
            handleDiscard={handleDiscard}
          >
            <ModelsForm
              isEdit={edit}
              disableFormFields={isEntityHead || isGeneralUser || isAuditor}
              formData={formData}
              setFormData={setFormData}
              isLoading={isLoading}
            />
          </SingleFormWrapper>
        )}
      </>
    );
  }

  return (
    <>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10%",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <SingleFormWrapper
          parentPageLink="/master"
          handleSubmit={handleSubmit}
          backBtn={false}
          redirectToTab="MODELS"
          disableFormFunction={
            isOrgAdmin
              ? false
              : isMR || isEntityHead || isGeneralUser || isAuditor
          }
          handleDiscard={handleDiscard}
          label="Model Master"
        >
          <ModelsForm
            isEdit={edit}
            disableFormFields={false}
            formData={formData}
            setFormData={setFormData}
            isLoading={isLoading}
          />
        </SingleFormWrapper>
      )}
    </>
  );
}

export default NewModel;

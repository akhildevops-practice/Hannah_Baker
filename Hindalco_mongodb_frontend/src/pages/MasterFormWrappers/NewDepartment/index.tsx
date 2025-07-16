import React, { useEffect, useState } from "react";
import FormStepper from "components/FormStepper";
import EntityForm from "components/MasterAddOrEditForm/EntityForm";
import SingleFormWrapper from "containers/SingleFormWrapper";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import { useRecoilState, useRecoilValue } from "recoil";
import { deptFormData } from "recoil/atom";
import { CircularProgress, debounce } from "@material-ui/core";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import checkRoles from "utils/checkRoles";
import EntityAdminFormContainer from "containers/EntityAdminFormContainer";
import BackButton from "components/BackButton";
import { roles } from "utils/enums";
import useStyles from "./styles";
import { ContactSupportOutlined } from "@material-ui/icons";
import { isValid, isValidMasterName } from "utils/validateInput";
interface Section {
  id: number;
  name: string;
  organizationId?: string;
  isSubmitted?: boolean;
  isEdit?: boolean;
  createdBy?: string;
  isFirstSubmit?: boolean;
}
type Props = {
  deletedId?: boolean;
};
const steps = ["Department", "Department Head"];

function NewDepartment({ deletedId }: Props) {
  const [selectFieldData, setSelectFieldData] = React.useState<any>({
    location: [],
    // functionId: [],
    // sections: [],
    entityTypes: [],
  });
  const [bu, setBu] = React.useState<any>([]);
  const [formData, setFormData] = useRecoilState(deptFormData);
  const [isLoading, setIsLoading] = React.useState(false);
  const [buttonLoading, setButtonLoading] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [functions, setFunctions] = React.useState<any>([]);
  const [departmentHeadList, setDepartmentHeadList] = React.useState<any>([]);
  const [isCreated, setIsCreated] = React.useState(false);
  const [sections, setSections] = React.useState<Section[]>([]);
  var typeAheadValue: string;
  let orgName = getAppUrl();
  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isMR = checkRoles("MR");
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isAuditor = checkRoles(roles.AUDITOR);
  const isAdmin = checkRoles("ADMIN");
  const isEntityHead = checkRoles("ENTITY-HEAD");
  const isGeneralUser = checkRoles("GENERAL-USER");

  let params = useParams();
  let paramArg = params.id;
  let edit = paramArg ? true : false;
  const userdetails: any = sessionStorage.getItem("userDetails");
  const userid: any = JSON.parse(userdetails).id;
  const [entityType, setEntityType] = useState<any>({});
  const [redirectToTab, setRedirectToTab] = useState("DEPARTMENTS");
  const locationstate = useLocation();
  const handleFinalSubmit = () => {
    navigate("/master", {
      state: {
        redirectToTab: "DEPARTMENTS",
        retain: false,
      },
    });
    enqueueSnackbar(`Entity Saved`, {
      variant: "success",
    });
    setFormData(deptFormData);
  };

  const handleSubmit = async () => {
    const validateEntityName = await isValidMasterName(formData.entityName);
    if (validateEntityName.isValid === false) {
      enqueueSnackbar(`Department name: ${validateEntityName?.errorMessage}`, {
        variant: "error",
      });
      return;
    }

    const validateEntityId = await isValidMasterName(formData.entityId);
    if (validateEntityId.isValid === false) {
      enqueueSnackbar(`Dept Id: ${validateEntityId?.errorMessage}`, {
        variant: "error",
      });
      return;
    }

    if (edit) {
      let {
        id,
        location,
        locationId,
        functionId,
        // businessType,
        // businessTypeId,
        sections,
        createdAt,
        ...finalValues
      } = formData;

      // formData.entityName
      if (
        formData.entityName
        // locationId &&
        // // businessTypeId &&
        // formData.entityId &&
        // formData.functionId
        // formData.sections.length
      ) {
        setButtonLoading(true);
        try {
          let res = await axios.put(`/api/entity/${id}`, {
            ...finalValues,
            entityName: formData.entityName.trim(),
            entityId: formData.entityId.trim(),
            realm: orgName,
            location: locationId,
            functionId: functionId,
            entityTypeId: formData.entityType,
            sections: formData.sections,
            additionalAuditee: formData?.additionalAuditee || [],
            notification: formData?.notification || [],
            // businessType: businessTypeId,
          });
          let result = await axios.post(`/api/audit-trial/createAuditTrial`, {
            moduleType: "DEPARTMENT",
            actionType: "UPDATE",
            transactionId: res.data.id,
            actionBy: userid,
          });

          // setFormData(deptForm);
          setButtonLoading(false);
          enqueueSnackbar(`Department Saved Successfully`, {
            variant: "success",
          });

          setFormData({
            ...formData,
            id: res.data.id,
          });

          setIsCreated(true);
          navigate("/master", {
            state: {
              redirectToTab: redirectToTab,
              retain: false,
            },
          });
        } catch (err: any) {
          setButtonLoading(false);
          enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
            variant: "error",
          });
        }
      } else {
        enqueueSnackbar(`Please fill all required fields`, {
          variant: "warning",
        });
      }
    } else {
      let { id, locationId, functionId, createdAt, sections, ...finalValues } =
        formData;
      if (
        // formData.location &&
        // formData.functionId &&
        // // formData.businessType &&
        formData.entityName &&
        formData.entityId &&
        formData.location
        // &&
        // formData.functions
      ) {
        setButtonLoading(true);
        try {
          try {
            let res = await axios.get(
              `/api/entity/getDeptEntityType/${orgName}`
            );
          } catch (err) {
            // console.error(err);
          }
          let res = await axios.post(`/api/entity`, {
            ...finalValues,
            entityName: formData.entityName.trim(),
            entityId: formData.entityId.trim(),
            functionId: formData.functionId ? formData.functionId : null,
            entityTypeId: formData.entityType,
            realm: orgName,
            sections: formData.sections ? formData.sections : null,
            additionalAuditee: formData?.additionalAuditee || [],
            notification: formData?.notification || [],
          });
          let result = await axios.post(`/api/audit-trial/createAuditTrial`, {
            moduleType: "DEPARTMENT",
            actionType: "CREATE",
            transactionId: res.data.id,
            actionBy: userid,
          });

          setButtonLoading(false);
          enqueueSnackbar(`Department Created Successfully`, {
            variant: "success",
          });
          setFormData({
            ...formData,
            id: res.data.id,
          });
          setIsCreated(true);
          navigate("/master", {
            state: {
              redirectToTab: redirectToTab,
              retain: false,
            },
          });
        } catch (err: any) {
          if (err.response.status === 409) {
            const response = await axios.get(
              `api/globalsearch/getRecycleBinList`
            );
            const data = response?.data;
            // console.log("data", data);
            const entityDocuments = data.find(
              (item: any) => item.type === "Entity"
            );

            // If there are entity documents
            if (entityDocuments) {
              // Check if the name already exists
              const existingEntity = entityDocuments.documents.find(
                (doc: any) => doc.entityName === formData?.entityName
              );

              // Return true if the name exists, otherwise false
              if (!!existingEntity) {
                enqueueSnackbar(
                  `Department with the same name already exists, please check in Recycle bin and Restore if required`,
                  {
                    variant: "error",
                  }
                );
                // navigate("/master", {
                //   state: { redirectToTab: "Recycle Bin" },
                // });
              } else {
                // console.log("inside else");
                enqueueSnackbar(
                  `Department with the same name already exists,
                  Please choose other name`,
                  {
                    variant: "error",
                  }
                );
              }
            }
          } else {
            enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
              variant: "error",
            });
          }
          setButtonLoading(false);
        }
      } else {
        enqueueSnackbar(`Please fill all required fields`, {
          variant: "warning",
        });
      }
    }
  };

  const handleDiscard = () => {
    // edit
    //   ?
    setFormData({
      realm: "",
      entityName: "",
      description: "",
      location: "",
      functionId: "",
      businessType: "",
      users: [],
      // sections: [],
      entityId: "",
      locationId: "",
      businessTypeId: "",
      id: "",
      createdAt: "",
    });
    // : setFormData(deptFormData);
  };

  const getLocationSectionEntityTypes = async () => {
    setIsLoading(true);
    try {
      let [res1, res2] = await Promise.all([
        axios.get(`api/location/getLocationsForOrg/${orgName}`),
        // axios.get(`api/location/getSectionsForOrg/${orgName}`),
        // axios.get(`api/business/getAllFunctionsInALoc/${organizationId}`),
        axios.get(`api/entity/getEntityTypes/byOrg/${orgName}`),
      ]);

      if (res1 && res2) {
        setSelectFieldData({
          ...selectFieldData,
          location: res1.data,
          // sections: res2.data,
          // function: res2.data,
          entityTypes: res2.data,
        });
        if (!edit && isLocAdmin) {
          setFormData({
            ...formData,
            location: res1?.data[0]?.id,
            entityType: res2?.data[0]?.id,
          });
        }
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      enqueueSnackbar(`Error ${err}`, { variant: "error" });
    }
  };
  const getAllFunctions = async (id: any) => {
    try {
      const response = await axios.get(
        `/api/business/getAllFunctionsInALoc/${id}`
      );
      const functionsResult = response.data;
      setFunctions(functionsResult);
    } catch (error) {
      // console.error("Error:", error);
    }
  };
  // console.log("entitytype in dept", entityType);

  const getAllUsersByLocation = async (id: any) => {
    try {
      const response = await axios.get(
        `/api/auditPlan/getAllUsersOfLocation/${id}`
      );
      const data = response.data;

      if (data) {
        const departmentHeadList = data.map((obj: any) => ({
          id: obj.id,
          name: obj.username,
          avatar: obj.avatar,
          email: obj.email,
        }));
        setDepartmentHeadList(departmentHeadList);
      }
    } catch (error) {
      // console.error(error);
      // Handle the error as needed, such as setting an error state or displaying a message.
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      if (isEntityHead || isGeneralUser) {
        setIsLoading(true);

        try {
          const entityResponse = await axios.get(
            `api/entity/getEntityForActiveUser`
          );
          const finalData = {
            ...entityResponse.data,
            // sections: entityResponse.data?.section?.map((item: any) => item.sectionId),
          };
          setFormData(finalData);
          setIsLoading(false);

          getLocationSectionEntityTypes();
          getAllFunctions(finalData.locationId);
          getAllUsersByLocation(finalData.locationId);
          // getBusinessTypes(finalData.locationId);
        } catch (err) {
          setIsLoading(false);
          // console.error(err);
        }
      } else if (edit || deletedId) {
        setIsLoading(true);

        try {
          const sectionsResponse = await axios.get(
            `api/business/getAllSectionsForEntity/${
              deletedId ? deletedId : paramArg
            }`
          );
          // console.log("sectionresponse", sectionsResponse);
          const entityResponse = await axios.get(
            `api/entity/getEntity/byId/${deletedId ? deletedId : paramArg}`
          );

          const locationId = entityResponse.data.location.locationId;
          let index =
            entityResponse.data.entityId.indexOf(locationId) +
            locationId.length;
          let result = entityResponse.data.entityId.substring(index);

          const finalData = {
            ...entityResponse.data,
            entityUserId: result,

            sectiondetails: sectionsResponse.data,
            // entityType: entityResponse.data?.entityType?.id,
            // sections: entityResponse.data?.section?.map((item: any) => item.sectionId),
          };
          setFormData(finalData);
          setIsLoading(false);

          getLocationSectionEntityTypes();
          getAllFunctions(finalData.locationId);
          getAllUsersByLocation(finalData.locationId);
        } catch (err) {
          setIsLoading(false);
          // console.error(err);
        }
      } else {
        getLocationSectionEntityTypes();
        setFormData(deptFormData);
      }
    };

    fetchData(); // Call the async function
  }, []);
  useEffect(() => {
    // console.log("navigation state parameters", locationstate.state);
    if (!!locationstate.state) {
      setEntityType({
        id: locationstate.state?.id,
        name: locationstate.state?.name,
      });
      setRedirectToTab(locationstate.state.key);
    } else if (edit) {
      setEntityType({
        id: formData.entityType?.id,
        name: formData?.entityType?.name,
      });
      setRedirectToTab(formData?.entityType?.id);
    }
  }, [locationstate.state, edit]);
  // console.log("entitytype name", formData);

  React.useEffect(() => {
    if (formData.location) {
      getAllFunctions(formData.location.id);
      getAllUsersByLocation(formData.location.id);
    }
    if (formData.locationId) {
      getAllFunctions(formData.locationId);
      getAllUsersByLocation(formData.locationId);
    }
    if (formData?.entityType) {
      setEntityType({
        id: formData.entityType?.id,
        name: formData?.entityType?.name,
      });
      setRedirectToTab(formData.entityType?.id);
    }
  }, [formData.locationId, formData.location]);
  // console.log("redirect tab", redirectToTab);
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
            parentPageLink="/master"
            backBtn={isEntityHead || isGeneralUser}
            handleSubmit={handleSubmit}
            disableFormFunction={isEntityHead || isGeneralUser || deletedId}
            label={`${entityType.name} master`}
            handleDiscard={handleDiscard}
            redirectToTab={redirectToTab}
          >
            <EntityForm
              selectFieldData={selectFieldData}
              edit={edit || isEntityHead}
              bu={bu}
              functions={functions}
              handleSubmit={handleSubmit}
              disableFormFields={isEntityHead || isGeneralUser || deletedId}
              deletedId={deletedId}
              entityType={entityType}
            />
          </SingleFormWrapper>
        )}
      </>
    );
  }
  return (
    <>
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <SingleFormWrapper
          parentPageLink="/master"
          // redirectToTab="DEPARTMENTS"
          backBtn={isEntityHead || isGeneralUser}
          disableFormFunction={isEntityHead || isGeneralUser || deletedId}
          handleSubmit={handleSubmit}
          handleDiscard={handleDiscard}
          label={`${entityType.name} master`}
          redirectToTab={redirectToTab}
        >
          <EntityForm
            selectFieldData={selectFieldData}
            edit={edit || isEntityHead}
            bu={bu}
            functions={functions}
            departmentHeadList={departmentHeadList}
            handleSubmit={handleSubmit}
            disableFormFields={isEntityHead || deletedId}
            deletedId={deletedId}
            entityType={entityType}
          />
        </SingleFormWrapper>
      )}
    </>
  );
}

export default NewDepartment;

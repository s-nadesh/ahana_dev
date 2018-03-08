<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PatAppointment;
use common\models\PatConsultant;
use common\models\PatEncounter;
use common\models\VBillingProfessionals;
use Yii;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class MyworkreportsController extends ActiveController {

    public $modelClass = 'common\models\PhaPurchase';

    public function behaviors() {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => QueryParamAuth::className()
        ];
        $behaviors['contentNegotiator'] = [
            'class' => ContentNegotiator::className(),
            'formats' => [
                'application/json' => Response::FORMAT_JSON,
            ],
        ];

        return $behaviors;
    }

    public function actionOpdoctorpaymentreport() {
        $post = Yii::$app->getRequest()->post();

        $encounters = PatEncounter::find()
                ->joinWith('patAppointmentSeen')
                ->joinWith("patAppointmentSeen.consultant")
                ->joinWith("patient")
                ->joinWith("patient.patGlobalPatient")
                ->joinWith("tenant")
                ->andWhere('pat_encounter.deleted_at = "0000-00-00 00:00:00"');

        if (isset($post['from']) && isset($post['to']) && isset($post['consultant_id']) && isset($post['tenant_id'])) {
            $consultant_ids = join("','", $post['consultant_id']);
            $tenant_ids = join("','", $post['tenant_id']);
            $encounters->andWhere("date(pat_encounter.encounter_date) between '{$post['from']}' AND '{$post['to']}'");
            $encounters->andWhere("pat_appointment.consultant_id IN ( '$consultant_ids' )");
            $encounters->andWhere("pat_encounter.tenant_id IN ( '$tenant_ids' )");
        }

        $encounters->addSelect(["pat_encounter.encounter_id as encounter_id"]);
        $encounters->addSelect(["pat_patient.patient_id as op_doctor_payment_patient_id"]);
        $encounters->addSelect(["pat_appointment.consultant_id as consultant_id"]);
        $encounters->addSelect(["co_tenant.tenant_name as branch_name"]);
        $encounters->addSelect(["CONCAT(co_user.title_code, '', co_user.name) as op_doctor_payment_consultant_name"]);
        $encounters->addSelect(["CONCAT(pat_global_patient.patient_title_code, ' ', pat_global_patient.patient_firstname) as op_doctor_payment_patient_name"]);
        $encounters->addSelect(["pat_global_patient.patient_global_int_code as op_doctor_payment_patient_global_int_code"]);
        $encounters->addSelect(["pat_global_patient.patient_mobile as op_doctor_payment_patient_mobile"]);
        $encounters->addSelect(["pat_appointment.amount as op_doctor_payment_amount"]);
        $encounters->addSelect(["pat_appointment.status_date as op_doctor_payment_seen_date"]);
        $encounters->addSelect(["pat_appointment.status_time as op_doctor_payment_seen_time"]);

        $encounters = $encounters->all();

        $reports = [];
        $sheetname = [];
        foreach ($encounters as $key => $encounter) {
            $reports[$key]['new_op'] = false;

            //Check first seen OP encounter
            $first_seen_appointment = PatAppointment::find()
                    ->status()
                    ->andWhere(['patient_id' => $encounter['op_doctor_payment_patient_id'], 'appt_status' => 'S'])
                    ->orderBy(['created_at' => SORT_ASC])
                    ->one();

            if (isset($first_seen_appointment) && !empty($first_seen_appointment)) {
                if ($first_seen_appointment->encounter_id == $encounter['encounter_id']) {
                    $reports[$key]['new_op'] = true;
                }
            }

            $reports[$key]['branch_name'] = $encounter['branch_name'];
            $reports[$key]['consultant_id'] = $encounter['consultant_id'];
            $sheetname[$key]['consultant_id'] = $encounter['consultant_id'];
            $sheetname[$key]['consultant_name'] = $encounter['op_doctor_payment_consultant_name'];
            $reports[$key]['consultant_name'] = $encounter['op_doctor_payment_consultant_name'];
            $reports[$key]['patient_name'] = $encounter['op_doctor_payment_patient_name'];
            $reports[$key]['patient_global_int_code'] = $encounter['op_doctor_payment_patient_global_int_code'];
            $reports[$key]['patient_mobile'] = $encounter['op_doctor_payment_patient_mobile'];
            $reports[$key]['payment_amount'] = $encounter['op_doctor_payment_amount'];
            $reports[$key]['op_seen_date_time'] = $encounter['op_doctor_payment_seen_date'] . " " . $encounter['op_doctor_payment_seen_time'];
            $reports[$key]['op_seen_date'] = $encounter['op_doctor_payment_seen_date'];
        }
        $sheetname = array_map("unserialize", array_unique(array_map("serialize", $sheetname)));
        return ['report' => $reports, 'sheetname' => $sheetname];
    }

    public function actionOpsummaryreport() {
        $post = Yii::$app->getRequest()->post();
        if (isset($post['consultant_id']) && isset($post['tenant_id'])) {
            $consultant_ids = join("','", $post['consultant_id']);
            $tenant_ids = join("','", $post['tenant_id']);
            $reports = PatAppointment::find()
                    //->select(['sum(amount) as amount', 'status_date'])
                    ->joinWith(['consultant', 'tenant'])
                    //->addSelect(["co_tenant.tenant_name as tenant_name"])
                    //->addSelect(["concat(co_user.title_code,co_user.name) as full_consultant_name"])
                    ->andWhere('pat_appointment.deleted_at = "0000-00-00 00:00:00"')
                    ->andWhere("status_date between '{$post['from']}' AND '{$post['to']}'")
                    ->andWhere("pat_appointment.consultant_id IN ( '$consultant_ids' )")
                    ->andWhere("pat_appointment.tenant_id IN ( '$tenant_ids' )")
                    ->andWhere("appt_status='S'")
                    //->groupBy(['status_date', 'consultant_id'])
                    ->all();
            //$reports = [];
//            foreach ($model as $key => $appoint) {
//                $reports[$key]['amount'] = $appoint['amount'];
//                $reports[$key]['status_date'] = $appoint['status_date'];
//                $reports[$key]['tenant_name'] = $appoint['tenant_name'];
//                $reports[$key]['full_consultant_name'] = $appoint['full_consultant_name'];
//            }
            return ['report' => $reports];
        }
    }

    public function actionIpbillstatus() {
        $post = Yii::$app->getRequest()->post();

        if (isset($post['consultant_id']) && isset($post['tenant_id'])) {
            $consultant_ids = join("','", $post['consultant_id']);
            $tenant_ids = join("','", $post['tenant_id']);
            $model = PatEncounter::find()
                    ->joinWith('patLiveAdmission')
                    ->status()
                    ->encounterType("IP")
                    ->andWhere("pat_admission.consultant_id IN ( '$consultant_ids' )")
                    ->andWhere("pat_encounter.tenant_id IN ( '$tenant_ids' )")
                    ->orderBy([
                        'encounter_date' => SORT_DESC,
                    ])
                    ->all();

            return $model;
        }
    }

    public function actionDischargedpatientbills() {
        $post = Yii::$app->getRequest()->post();

        $encounters = PatEncounter::find()
                ->joinWith('patAdmissionClinicalDischarge')
//                ->status()
                ->encounterType("IP")
                ->finalized();
//                ->unauthorized();

        if (isset($post['from']) && isset($post['to']) && isset($post['consultant_id']) && isset($post['tenant_id'])) {
            $consultant_ids = join("','", $post['consultant_id']);
            $tenant_ids = join("','", $post['tenant_id']);
            $encounters->andWhere("date(pat_encounter.finalize_date) between '{$post['from']}' AND '{$post['to']}'");
            $encounters->andWhere("pat_admission.consultant_id IN ( '$consultant_ids' )");
            $encounters->andWhere("pat_encounter.tenant_id IN ( '$tenant_ids' )");
        }

        $encounters->andWhere("pat_encounter.bill_no != ''");

        $result = $encounters->all();

        return $result;
    }

    public function actionIpdoctorspay() {
        $post = Yii::$app->getRequest()->post();

        $consultants = PatConsultant::find()
                ->joinWith("patient")
                ->joinWith("patient.patGlobalPatient")
                ->joinWith("consultant")
                ->joinWith("encounter")
                ->joinWith("tenant")
                ->andWhere('pat_encounter.encounter_type = "IP"')
//                ->andWhere('pat_encounter.status = "1"')
                ->andWhere('pat_encounter.finalize > "0"')
//                ->andWhere('pat_encounter.authorize = "0"')
                ->andWhere('pat_consultant.deleted_at = "0000-00-00 00:00:00"');

        if (isset($post['from']) && isset($post['to']) && isset($post['consultant_id']) && isset($post['tenant_id'])) {
            $tenant_ids = join("','", $post['tenant_id']);
            $consultant_ids = join("','", $post['consultant_id']);
            $consultants->andWhere("pat_consultant.tenant_id IN ( '$tenant_ids' )");
            $consultants->andWhere("pat_consultant.consultant_id IN ( '$consultant_ids' )");
            $consultants->andWhere("date(pat_encounter.finalize_date) between '{$post['from']}' AND '{$post['to']}'");
        }

        $consultants->addSelect(["pat_patient.patient_id as patient_id"]);
        $consultants->addSelect(["co_tenant.tenant_id as tenant_id"]);
        $consultants->addSelect(["co_tenant.tenant_name as branch_name"]);
        $consultants->addSelect(["pat_consultant.consultant_id as consultant_id"]);
        $consultants->addSelect(["CONCAT(co_user.title_code, '', co_user.name) as report_consultant_name"]);
        $consultants->addSelect(["CONCAT(pat_global_patient.patient_title_code, ' ', pat_global_patient.patient_firstname) as report_patient_name"]);
        $consultants->addSelect(["pat_global_patient.patient_global_int_code as report_patient_global_int_code"]);
        $consultants->addSelect(["COUNT(pat_consultant.charge_amount) as report_total_visit"]);
        $consultants->addSelect(["SUM(pat_consultant.charge_amount) as report_total_charge_amount"]);
        $consultants->addSelect(["GROUP_CONCAT(pat_encounter.encounter_id) as grouped_encounter_ids"]);

        $consultants->groupBy(["pat_consultant.consultant_id", "pat_consultant.patient_id"]);
        $consultants->orderBy(["pat_global_patient.patient_firstname" => SORT_ASC]);

        $consultants = $consultants->all();

        $reports = [];
        $sheetname = [];

        foreach ($consultants as $key => $encounter) {
            $reports[$key]['branch_name'] = $encounter['branch_name'];
            $reports[$key]['consultant_id'] = $encounter['consultant_id'];
            $sheetname[$key]['consultant_id'] = $encounter['consultant_id'];
            $sheetname[$key]['consultant_name'] = $encounter['report_consultant_name'];
            $reports[$key]['consultant_name'] = $encounter['report_consultant_name'];
            $reports[$key]['patient_name'] = $encounter['report_patient_name'];
            $reports[$key]['patient_global_int_code'] = $encounter['report_patient_global_int_code'];
            $reports[$key]['total_visit'] = $encounter['report_total_visit'];
//            $reports[$key]['total_charge_amount'] = $encounter['report_total_charge_amount'];
            $professional = VBillingProfessionals::find()
                            ->where([
                                'category_id' => $encounter['consultant_id'],
                                'patient_id' => $encounter['patient_id'],
                                'tenant_id' => $encounter['tenant_id']
                            ])
                            ->andWhere("encounter_id IN ({$encounter['grouped_encounter_ids']})")
                            ->select('SUM(total_charge) as total_charge, SUM(concession_amount) as concession_amount, SUM(extra_amount) as extra_amount')->one();

            $reports[$key]['total_charge_amount'] = ($professional->total_charge + $professional->extra_amount) - $professional->concession_amount;
        }
        $sheetname = array_map("unserialize", array_unique(array_map("serialize", $sheetname)));
        return ['report' => $reports, 'sheetname' => $sheetname];
    }

}

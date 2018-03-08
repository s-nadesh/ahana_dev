<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PatConsultant;
use common\models\PatPatient;
use common\models\CoAuditLog;
use common\models\PatProcedure;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PatientconsultantController extends ActiveController {

    public $modelClass = 'common\models\PatConsultant';

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

    public function actions() {
        $actions = parent::actions();
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];

        return $actions;
    }

    public function prepareDataProvider() {
        /* @var $modelClass BaseActiveRecord */
        $modelClass = $this->modelClass;

        return new ActiveDataProvider([
            'query' => $modelClass::find()->tenant()->active()->orderBy(['created_at' => SORT_DESC]),
            'pagination' => false,
        ]);
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = PatConsultant::find()->where(['pat_consult_id' => $id])->one();
            $model->remove();
            $activity = 'Consultant Deleted Successfully (#' . $model->encounter_id . ' )';
            CoAuditLog::insertAuditLog(PatConsultant::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

//    public function actionGetpatconsultantsbyencounter() {
//        $enc_id = Yii::$app->getRequest()->get('enc_id');
//
//        if (!empty($enc_id)) {
//            $model = PatConsultant::find()
//                    ->tenant()
//                    ->status()
//                    ->active()
//                    ->andWhere(['encounter_id' => $enc_id])
//                    ->orderBy([
//                        'consult_date' => SORT_DESC,
//                    ])
//                    ->all();
//        }
//
//        return $model;
//    }

    public function actionGetpatconsultantsbyencounter() {
        $get = Yii::$app->getRequest()->get();
        if (!empty($get)) {
            $patient = PatPatient::getPatientByGuid($get['patient_id']);

            $all_patient_id = PatPatient::find()
                    ->select('GROUP_CONCAT(patient_id) AS allpatient')
                    ->where(['patient_global_guid' => $patient->patient_global_guid])
                    ->one();

            $result = [];
            $consultant = PatConsultant::find()
                    ->where("patient_id IN ($all_patient_id->allpatient)");
            if (isset($get['date'])) {
                $consultant->andWhere(['DATE(consult_date)' => $get['date']]);
            }
            $data = $consultant->andWhere(['or',
                            ['=', 'consultant_id', Yii::$app->user->identity->user_id],
                            ['=', 'created_by', Yii::$app->user->identity->user_id],
                            ['privacy' => '0'],
                    ])
                    ->active()
                    ->status()
                    ->groupBy('encounter_id')
                    ->orderBy(['encounter_id' => SORT_DESC])
                    ->all();

            foreach ($data as $key => $value) {
                $consultant_details = PatConsultant::find()
                        ->where("patient_id IN ($all_patient_id->allpatient)")
                        ->andWhere(['encounter_id' => $value->encounter_id]);
                if (isset($get['date'])) {
                    $consultant_details->andWhere(['DATE(consult_date)' => $get['date']]);
                }
                $details = $consultant_details->andWhere(['or',
                                ['=', 'consultant_id', Yii::$app->user->identity->user_id],
                                ['=', 'created_by', Yii::$app->user->identity->user_id],
                                ['privacy' => '0'],
                        ])
                        ->active()
                        ->status()
                        ->orderBy(['consult_date' => SORT_DESC])
                        ->all();

                $result[$key] = ['data' => $value, 'all' => $details];
            }
            return ['success' => true, 'result' => $result];
        }
    }

    public function actionBulkinsert() {
        $post = Yii::$app->getRequest()->post();

        if (!empty($post)) {
            foreach ($post['consultant_visit'] as $key => $value) {
                $pat_consultant = new PatConsultant;

                $pat_consultant->encounter_id = $value['encounter_id'];
                $pat_consultant->patient_id = $value['patient_id'];
                $pat_consultant->consultant_id = $post['data']['consultant_id'];
                $pat_consultant->consult_date = $post['data']['consult_date'];
                if (isset($value['notes']) && !empty($value['notes']))
                    $pat_consultant->notes = $value['notes'];
                if (isset($post['data']['notes']) && !empty($post['data']['notes']))
                    $pat_consultant->notes = $post['data']['notes'];
                $pat_consultant->save(false);
            }
            return ['success' => true];
        }
    }

    public function actionGetcharges() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            $tenant_ids = join("','", $post['tenant_id']);

            $consultant = PatConsultant::find()
                    ->select(['sum(charge_amount) as charge_amount', 'pat_consultant.tenant_id'])
                    ->joinWith(['encounter', 'tenant', 'consultant'])
                    ->addSelect(["co_tenant.tenant_name as branch_name"])
                    ->addSelect(["concat(co_user.title_code,co_user.name) as report_consultant_name"])
                    ->andWhere("pat_consultant.tenant_id IN ( '$tenant_ids' )")
                    ->andWhere("date(consult_date) between '{$post['from']}' AND '{$post['to']}'")
                    ->andWhere("pat_encounter.encounter_type='OP'")
                    ->andWhere("pat_consultant.deleted_at='0000-00-00 00:00:00'")        
                    ->groupBy(['pat_consultant.consultant_id'])
                    ->all();
            $consultantCharges = [];
            foreach ($consultant as $key => $charges) {
                $consultantCharges[$key]['amount'] = $charges['charge_amount'];
                $consultantCharges[$key]['charge_category'] = 'Professional charges';
                $consultantCharges[$key]['charge_sub_category'] = $charges['report_consultant_name'];
                $consultantCharges[$key]['tenant_name'] = $charges['branch_name'];
                $consultantCharges[$key]['tenant_id'] = $charges['tenant_id'];
            }

            $procedure = PatProcedure::find()
                    ->select(['sum(charge_amount) as charge_amount', 'pat_procedure.tenant_id'])
                    ->joinWith(['encounter', 'tenant', 'chargeCat'])
                    ->addSelect(["co_tenant.tenant_name as branch_name"])
                    ->addSelect(["co_room_charge_subcategory.charge_subcat_name as charge_sub_category"])
                    ->andWhere("pat_procedure.tenant_id IN ( '$tenant_ids' )")
                    ->andWhere("date(proc_date) between '{$post['from']}' AND '{$post['to']}'")
                    ->andWhere("pat_encounter.encounter_type='OP'")
                    ->andWhere("pat_procedure.deleted_at='0000-00-00 00:00:00'")
                    ->groupBy(['pat_procedure.charge_subcat_id'])
                    ->all();
            $procedureCharges = [];
            foreach ($procedure as $key => $charges) {
                $procedureCharges[$key]['amount'] = $charges['charge_amount'];
                $procedureCharges[$key]['charge_category'] = 'Procedure charges';
                $procedureCharges[$key]['charge_sub_category'] = $charges['charge_sub_category'];
                $procedureCharges[$key]['tenant_name'] = $charges['branch_name'];
                $procedureCharges[$key]['tenant_id'] = $charges['tenant_id'];
            }

            $non_recurring = array();
            if (is_array($consultantCharges))
                $non_recurring = array_merge($non_recurring, $consultantCharges);
            if (is_array($procedureCharges))
                $non_recurring = array_merge($non_recurring, $procedureCharges);
            return ['non_recurring' => $non_recurring];
        }
    }

}

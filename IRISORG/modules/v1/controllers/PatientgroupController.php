<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoPatientGroup;
use common\models\CoPatientGroupsPatients;
use common\models\PatGlobalPatient;
use common\models\PatPatient;
use common\models\CoAuditLog;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * SpecialityController implements the CRUD actions for CoTenant model.
 */
class PatientgroupController extends ActiveController {

    public $modelClass = 'common\models\CoPatientGroup';

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
            'query' => $modelClass::find()->active()->orderBy(['group_name' => SORT_ASC]),
            'pagination' => false,
        ]);
    }
    
    public function actionPatientgroup() {
        $GET = Yii::$app->getRequest()->get();
        $limit = isset($GET['l']) ? $GET['l'] : 10;
        $page = isset($GET['p']) ? $GET['p'] : 1;
        $data=$result=$totalCount=[];
        $data = CoPatientGroup::find()->active();
        if (isset($GET['s']) && !empty($GET['s'])) {
                $text = $GET['s'];
                $data->andFilterWhere([
                'or',
                    ['like', 'group_name', $text],
                ]);
            }
        $offset = abs($page - 1) * $limit;
        
        $totalCount= $data->count();
        $result = $data->orderBy(['group_name' => SORT_ASC])
                ->limit($limit)
                ->offset($offset)
                ->all();

        return ['success' => true, 'patientgroups' => $result,  'totalCount' => $totalCount];
    }

    public function actionGetpatientgrouplist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        return ['patientgroupList' => CoPatientGroup::getPatientGrouplist($status, $deleted)];
    }

    public function actionGetpatientgroupbypatient() {
        $get = Yii::$app->getRequest()->get();
        if (isset($get['id'])) {
            $patient = PatPatient::getPatientByGuid($get['id']);
            return ['groups' => $patient->patGlobalPatient->patientGroups];
        }
    }

    public function actionSyncpatient() {
        $post = Yii::$app->getRequest()->post();
        $group_id = $post['patient_group_id'];

        if (isset($post['patient_guid'])) {
            $patient = PatPatient::getPatientByGuid($post['patient_guid']);
            $global_patient_id = $patient->patGlobalPatient->global_patient_id;
        } else if (isset($post['global_patient_id'])) {
            $global_patient_id = $post['global_patient_id'];
        }

        if (isset($post['sync'])) {
            if ($post['sync'] == 'link') {
                $gl_patient = PatGlobalPatient::syncPatientGroup($global_patient_id, [$group_id]);
            } else if ($post['sync'] == 'unlink') {
                $gl_patient = PatGlobalPatient::syncPatientGroup($global_patient_id, [$group_id], 'unlink');
            }
        }
        return ['patient' => $gl_patient];
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            //check any patients assigned to this group
            $patients_assigned = CoPatientGroupsPatients::find()->where(['patient_group_id' => $id])->count();
            if ($patients_assigned > 0) {
                return ['success' => false, 'message' => $patients_assigned . ' Patient(s) are assigned to this group, you can not delete this group'];
            } else {
                $model = CoPatientGroup::find()->where(['patient_group_id' => $id])->one();
                $model->remove();
                $activity = 'Patient Group Deleted Successfully (#' . $model->group_name . ' )';
                CoAuditLog::insertAuditLog(CoPatientGroup::tableName(), $id, $activity);
                return ['success' => true];
            }
        }
    }

}

<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoUser;
use common\models\PatNotes;
use common\models\PatNotesUsers;
use common\models\PatPatient;
use common\models\CoAuditLog;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\db\Expression;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PatientnotesController extends ActiveController {

    public $modelClass = 'common\models\PatNotes';

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

    public function actionGetpatientnotes() {
        $get = Yii::$app->getRequest()->get();
        $user_id = Yii::$app->user->identity->user->user_id;

        if (!empty($get)) {
            $patient = PatPatient::getPatientByGuid($get['patient_id']);

            $all_patient_id = PatPatient::find()
                    ->select('GROUP_CONCAT(patient_id) AS allpatient')
                    ->where(['patient_global_guid' => $patient->patient_global_guid])
                    ->one();

            $result = [];
            $notes = PatNotes::find()
                    ->active()
                    ->status()
                    ->where("patient_id IN ($all_patient_id->allpatient)");
            if (isset($get['date'])) {
                $notes->andWhere(['DATE(created_at)' => $get['date']]);
            }
            $data = $notes->groupBy('encounter_id')
                    ->orderBy(['encounter_id' => SORT_DESC])
                    ->all();

            foreach ($data as $key => $value) {
                $notes_details = PatNotes::find()
                        ->active()
                        ->status()
                        ->where("patient_id IN ($all_patient_id->allpatient)");
                if (isset($get['date'])) {
                    $notes_details->andWhere(['DATE(created_at)' => $get['date']]);
                }
                $details = $notes_details->andWhere(['encounter_id' => $value->encounter_id])
                        ->orderBy(['pat_note_id' => SORT_DESC])
                        ->all();
                $result[$key] = ['data' => $value, 'all' => $details];
            }

            $usernotes = PatNotesUsers::find()->tenant()->andWhere(['user_id' => $user_id, 'seen' => '0', 'patient_id' => $patient->patient_id])->all();
            return ['success' => true, 'result' => $result, 'usernotes' => $usernotes];
        }
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = PatNotes::find()->where(['pat_note_id' => $id])->one();
            $model->remove();
            $activity = 'Patient Notes Deleted Successfully (#' . $model->encounter_id . ' )';
            CoAuditLog::insertAuditLog(PatNotes::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

    public function actionAssignnotes() {
        $post = Yii::$app->request->post();
        $user_id = Yii::$app->user->identity->user->user_id;
        $tenant_id = Yii::$app->user->identity->user->tenant_id;

        $user = CoUser::find()->where(['user_id' => $user_id])->one();
        $patient = PatPatient::getPatientByGuid($post['patient_guid']);
        $notes = PatNotes::find()->tenant()->andWhere(['patient_id' => $patient->patient_id])->andWhere("created_by != $user_id")->all();

        $extraColumns = ['tenant_id' => $tenant_id, 'modified_by' => Yii::$app->user->identity->user_id, 'modified_at' => new Expression('NOW()'), 'patient_id' => $patient->patient_id]; // extra columns to be saved to the many to many table
        $unlink = true; // unlink tags not in the list
        $delete = true; // delete unlinked tags
        $user->linkAll('notes', $notes, $extraColumns, $unlink, $delete);
        return ['success' => true];
    }

    public function actionSeennotes() {
        $post = Yii::$app->request->post();
        $user_id = Yii::$app->user->identity->user->user_id;
        $ids = implode(',', $post['ids']);

        $patient = PatPatient::getPatientByGuid($post['patient_guid']);
        $notes = PatNotes::find()->tenant()->active()->andWhere(['patient_id' => $patient->patient_id])->orderBy(['created_at' => SORT_DESC])->all();

        PatNotesUsers::updateAll(['seen' => '1'], "user_id = :user_id AND note_id IN ($ids) AND patient_id = :patient_id", [
            ':user_id' => $user_id,
            ':patient_id' => $patient->patient_id
        ]);
        return ['success' => true];
    }

    public function actionBulkinsert() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            foreach ($post['patientdata'] as $value) {
                $model = new PatNotes();
                $model->encounter_id = $value['encounter_id'];
                $model->patient_id = $value['patient_id'];
                $model->notes = $post['notes'];
                $model->save(false);
            }
            return ['success' => true];
        }
    }

}

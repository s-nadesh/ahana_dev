<?php

namespace common\models;

use common\models\query\CoPatientGroupQuery;
use cornernote\linkall\LinkAllBehavior;
use Yii;

/**
 * This is the model class for table "co_patient_group".
 *
 * @property integer $patient_group_id
 * @property string $group_name
 * @property string $short_code
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 */
class CoPatientGroup extends PActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_patient_group';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['group_name'], 'required'],
            [['status'], 'string'],
            [['created_by', 'modified_by'], 'integer'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe'],
            [['group_name'], 'string', 'max' => 50],
            [['short_code'], 'string', 'max' => 10],
            [['group_name'], 'unique', 'targetAttribute' => ['group_name', 'deleted_at'], 'message' => 'The combination of Name has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'patient_group_id' => 'Patient Group ID',
            'group_name' => 'Group Name',
            'short_code' => 'Short Code',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    public static function find() {
        return new CoPatientGroupQuery(get_called_class());
    }

    public static function getPatientGrouplist($status = '1', $deleted = false) {
        if (!$deleted)
            $list = self::find()->status($status)->active()->all();
        else
            $list = self::find()->deleted()->all();

        return $list;
    }

    public function behaviors() {
        $extend = [
            LinkAllBehavior::className(),
        ];

        $behaviour = array_merge(parent::behaviors(), $extend);
        return $behaviour;
    }

    public function getPatientGroupsPatients() {
        return $this->hasMany(CoPatientGroupsPatients::className(), ['patient_group_id' => 'patient_group_id']);
    }

    public function getPatients() {
        return $this->hasMany(PatGlobalPatient::className(), ['global_patient_id' => 'global_patient_id'])->via('patientGroupsPatients');
    }

    public function fields() {
        $extend = [
            'patients' => function ($model) {
                return (isset($model->patients) ? $model->patients : '-');
            },
        ];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'pharmacylist':
                    $addt_keys = ['patients'];
                    break;
            endswitch;

            return array_merge(parent::fields(), array_intersect_key($extend, array_flip($addt_keys)));
        }
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }
    
    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Patient Group Added Successfully (#' . $this->group_name . ' )';
        else
            $activity = 'Patient Group Updated Successfully (#' . $this->group_name . ' )';
        CoAuditLog::insertAuditLog(CoMasterCity::tableName(), $this->patient_group_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }
}

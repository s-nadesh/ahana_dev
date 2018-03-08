<?php

namespace common\models;

use common\models\query\CoPatientCategoryQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_patient_category".
 *
 * @property integer $patient_cat_id
 * @property integer $tenant_id
 * @property string $patient_cat_name
 * @property string $patient_short_code
 * @property string $patient_cat_color
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 */
class CoPatientCategory extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_patient_category';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['patient_cat_name', 'patient_cat_color', 'patient_short_code'], 'required'],
                [['tenant_id', 'created_by', 'modified_by'], 'integer'],
                [['created_at', 'modified_at', 'deleted_at', 'patient_short_code'], 'safe'],
                [['status'], 'string'],
                [['patient_cat_name'], 'string', 'max' => 50],
                [['patient_cat_color'], 'string', 'max' => 10],
                [['patient_short_code'], 'string', 'max' => 2],
                [['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'patient_cat_name', 'deleted_at'], 'message' => 'The combination of Name has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'patient_cat_id' => 'Patient Cat ID',
            'tenant_id' => 'Tenant ID',
            'patient_cat_name' => 'Patient Category Name',
            'patient_cat_color' => 'Patient Category Color',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new CoPatientCategoryQuery(get_called_class());
    }

    public static function getPatientCateogrylist($status = '1', $deleted = false) {
        if (!$deleted)
            $list = self::find()->status($status)->active()->all();
        else
            $list = self::find()->deleted()->all();

        return $list;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Patient Category Added Successfully (#' . $this->patient_cat_name . ' )';
        else
            $activity = 'Patient Category Updated Successfully (#' . $this->patient_cat_name . ' )';
        CoAuditLog::insertAuditLog(CoPatientCategory::tableName(), $this->patient_cat_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}

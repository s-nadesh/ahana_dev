<?php

namespace common\models;

use common\models\query\CoUsersBranchesQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_users_branches".
 *
 * @property integer $user_branch_id
 * @property integer $tenant_id
 * @property integer $user_id
 * @property integer $branch_id
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 *
 * @property CoTenant $branch
 * @property CoTenant $tenant
 * @property CoUser $user
 */
class CoUsersBranches extends RActiveRecord {

    public $branch_ids;
    public $tenant_name;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_users_branches';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['tenant_id', 'user_id', 'branch_ids'], 'required', 'on' => 'branchassign'],
            [['tenant_id', 'user_id', 'branch_id', 'created_by', 'modified_by'], 'integer'],
            [['created_at', 'modified_at', 'branch_ids','tenant_name'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'user_branch_id' => 'User Branch ID',
            'tenant_id' => 'Tenant ID',
            'user_id' => 'User',
            'branch_id' => 'Branch ID',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'branch_ids' => 'Branch',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getBranch() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'branch_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getUser() {
        return $this->hasOne(CoUser::className(), ['user_id' => 'user_id']);
    }

    public static function find() {
        return new CoUsersBranchesQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'branch_name' => function ($model) {
                return (isset($model->branch) ? $model->branch->tenant_name : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }
    
//    public function afterSave($insert, $changedAttributes) {
//        $user = CoUser::find()->where(['user_id' => $this->user_id])->one();
//        if ($insert)
//            $activity = 'User Branches assigned Successfully (#' . $user->name . ' )';
//        else
//            $activity = 'User Branches Updated Successfully (#' . $user->name . ' )';
//        CoAuditLog::insertAuditLog(CoUsersBranches::tableName(), $this->user_branch_id, $activity);
//        return parent::afterSave($insert, $changedAttributes);
//    }

}
